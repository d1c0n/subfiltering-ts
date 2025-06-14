import { DOMParser, XMLSerializer, Node, Element } from "@xmldom/xmldom";
import { CTypeEnum } from "../enums/CTypeEnum";

interface AdaptedXmlNode {
	tagName: string;
	attributes: Record<string, string>;
	has_children: boolean;
	inner_html: AdaptedXmlNode[];
	nodeString: string;
}

export class DataRefReplacer {
	private map: Map<string, string>;
	private readonly domParser = new DOMParser({
		errorHandler: (level, msg) => {
			/* ignore */
		},
	});
	private readonly xmlSerializer = new XMLSerializer();

	constructor(map: Record<string, string | null | undefined> = {}) {
		this.map = new Map(Object.entries(this.sanitizeMap(map)));
	}

	private sanitizeMap(map: Record<string, any>): Record<string, string> {
		const sanitized: Record<string, string> = {};
		for (const name in map) {
			if (Object.prototype.hasOwnProperty.call(map, name)) {
				const value = map[name];
				if (
					value === null ||
					value === "" ||
					typeof value === "undefined"
				) {
					sanitized[name] = "NULL";
				} else {
					sanitized[name] = String(value);
				}
			}
		}
		return sanitized;
	}

	private getAttribute(
		attributes: Record<string, string>,
		key: string,
		defaultValue?: string,
	): string | undefined {
		return attributes.hasOwnProperty(key)
			? attributes[key]
			: defaultValue;
	}

	private getMapValue(
		key: string | undefined | null,
		defaultValue: string = "NULL",
	): string {
		if (key === null || typeof key === "undefined") return defaultValue;
		return this.map.has(key)
			? (this.map.get(key) as string)
			: defaultValue;
	}

	private transformDomToAdaptedNode(element: Element): AdaptedXmlNode {
		const attributes: Record<string, string> = {};
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i];
			attributes[attr.name] = attr.value;
		}

		const inner_html: AdaptedXmlNode[] = [];
		if (element.childNodes) {
			for (let i = 0; i < element.childNodes.length; i++) {
				const child = element.childNodes[i];
				if (child.nodeType === 1) {
					inner_html.push(
						this.transformDomToAdaptedNode(child as Element),
					);
				}
			}
		}

		const nodeString = this.xmlSerializer.serializeToString(element as Node);

		return {
			tagName: element.tagName,
			attributes: attributes,
			has_children: inner_html.length > 0,
			inner_html: inner_html,
			nodeString: nodeString,
		};
	}

	private parseXmlStringToAdaptedNodes(
		xmlString: string,
	): AdaptedXmlNode[] {
		try {
			const wrappedXml = `<dummyRoot>${xmlString}</dummyRoot>`;
			const doc = this.domParser.parseFromString(wrappedXml, "text/xml");

			const parserErrors = doc.getElementsByTagName("parsererror");
			if (parserErrors.length > 0) {
				return [];
			}

			const rootElement = doc.documentElement;
			if (!rootElement || !rootElement.childNodes) return [];

			const adaptedNodes: AdaptedXmlNode[] = [];
			for (let i = 0; i < rootElement.childNodes.length; i++) {
				const node = rootElement.childNodes[i];
				if (node.nodeType === node.ELEMENT_NODE) {
					adaptedNodes.push(
						this.transformDomToAdaptedNode(node as Element),
					);
				}
			}
			return adaptedNodes;
		} catch (e) {
			return [];
		}
	}

	public replace(originalString: string): string {
		if (
			this.map.size === 0 ||
			!this.hasAnyDataRefAttribute(originalString)
		) {
			return originalString;
		}

		let currentString = originalString;

		try {
			currentString = this.replaceSelfClosingPcTagsWithRegex(
				currentString,
			);

			const adaptedNodes = this.parseXmlStringToAdaptedNodes(
				currentString,
			);
			if (!adaptedNodes.length && currentString.includes("dataRef")) {
				// Logic remains the same
			}

			const dataRefEndMap: Array<{ id?: string; dataRefEnd?: string }> =
				[];

			for (const node of adaptedNodes) {
				currentString = this.recursiveTransformDataRefToPhTag(
					node,
					currentString,
				);
				this.extractDataRefMapRecursively(
					node,
					currentString,
					dataRefEndMap,
				);
			}

			currentString = this.replaceOpeningPcTags(currentString);
			currentString = this.replaceClosingPcTags(
				currentString,
				dataRefEndMap,
			);
		} catch (ignore) {
			// If something fails, return the original string
		}
		return currentString;
	}

	private replaceSelfClosingPcTagsWithRegex(
		currentFullString: string,
	): string {
		let newFullString = currentFullString;
		const selfClosingPcRegex = /<pc([^>]*?)\/>/gi;

		let match;
		while ((match = selfClosingPcRegex.exec(currentFullString)) !== null) {
			const selfClosingTagString = match[0];

			const parsedNodes = this.parseXmlStringToAdaptedNodes(
				selfClosingTagString,
			);
			if (!parsedNodes || parsedNodes.length === 0) continue;

			const node = parsedNodes[0];
			const dataRefStartAttr = this.getAttribute(
				node.attributes,
				"dataRefStart",
			);

			if (dataRefStartAttr && this.map.has(dataRefStartAttr)) {
				const mappedValue = this.getMapValue(dataRefStartAttr);
				const id = this.getAttribute(node.attributes, "id");

				newFullString = this.replaceNewTagString(
					selfClosingTagString,
					id,
					mappedValue,
					CTypeEnum.PC_SELF_CLOSE_DATA_REF,
					newFullString,
				);
			}
		}

		return newFullString;
	}

	private hasAnyDataRefAttribute(str: string): boolean {
		const regex = /(dataRef|dataRefStart|dataRefEnd)=['"].*?['"]/;
		return regex.test(str);
	}

	private recursiveTransformDataRefToPhTag(
		node: AdaptedXmlNode,
		currentFullString: string,
	): string {
		let newFullString = currentFullString;

		if (node.has_children) {
			for (const childNode of node.inner_html) {
				newFullString = this.recursiveTransformDataRefToPhTag(
					childNode,
					newFullString,
				);
			}
		} else {
			let ctype: CTypeEnum | undefined;
			switch (node.tagName) {
				case "ph":
					ctype = CTypeEnum.PH_DATA_REF;
					break;
				case "sc":
					ctype = CTypeEnum.SC_DATA_REF;
					break;
				case "ec":
					ctype = CTypeEnum.EC_DATA_REF;
					break;
				default:
					return newFullString;
			}

			const dataRefValue = this.getAttribute(
				node.attributes,
				"dataRef",
			);
			if (!dataRefValue || !this.map.has(dataRefValue)) {
				return newFullString;
			}

			const id = this.getAttribute(node.attributes, "id", dataRefValue);
			const mappedValue = this.getMapValue(dataRefValue);

			return this.replaceNewTagString(
				node.nodeString,
				id,
				mappedValue,
				ctype,
				newFullString,
				null,
			);
		}
		return newFullString;
	}

	private extractDataRefMapRecursively(
		node: AdaptedXmlNode,
		completeString: string,
		dataRefEndMap: Array<{ id?: string; dataRefEnd?: string }>,
	): void {
		if (node.has_children) {
			node.inner_html.forEach((nestedNode) => {
				this.extractDataRefMapRecursively(
					nestedNode,
					completeString,
					dataRefEndMap,
				);
			});
		}

		if (node.tagName === "pc") {
			const id = this.getAttribute(node.attributes, "id");
			const dataRefStart = this.getAttribute(
				node.attributes,
				"dataRefStart",
			);
			const dataRefEnd = this.getAttribute(
				node.attributes,
				"dataRefEnd",
				dataRefStart,
			);

			dataRefEndMap.push({
				id: id,
				dataRefEnd: dataRefEnd,
			});
		}
	}

	private replaceOpeningPcTags(currentFullString: string): string {
		let newFullString = currentFullString;
		const openingPcRegex = /<pc([^>/]*?)>/gi;

		const matches = [];
		let match;
		while ((match = openingPcRegex.exec(newFullString)) !== null) {
			matches.push(match);
		}

		for (const pcMatch of matches) {
			const openingTagString = pcMatch[0];

			const tempXmlToParse = `${openingTagString}</pc>`;
			const parsedNodes =
				this.parseXmlStringToAdaptedNodes(tempXmlToParse);
			if (!parsedNodes || parsedNodes.length === 0) continue;

			const node = parsedNodes[0];

			let dataRefStart = this.getAttribute(
				node.attributes,
				"dataRefStart",
			);
			let dataRefEnd = this.getAttribute(
				node.attributes,
				"dataRefEnd",
			);

			if (
				typeof dataRefEnd !== "undefined" &&
				typeof dataRefStart === "undefined"
			) {
				dataRefStart = dataRefEnd;
			} else if (
				typeof dataRefStart !== "undefined" &&
				typeof dataRefEnd === "undefined"
			) {
				dataRefEnd = dataRefStart;
			}

			if (typeof dataRefStart !== "undefined") {
				const id = this.getAttribute(node.attributes, "id");
				const mappedValue = this.getMapValue(dataRefStart);

				newFullString = this.replaceNewTagString(
					openingTagString,
					id,
					mappedValue,
					CTypeEnum.PC_OPEN_DATA_REF,
					newFullString,
				);
			}
		}
		return newFullString;
	}

	private replaceClosingPcTags(
		currentFullString: string,
		dataRefEndMap: Array<{ id?: string; dataRefEnd?: string }>,
	): string {
		let newFullString = currentFullString;
		const closingPcRegex = /<\/pc>/gi;

		const matches: Array<{ index: number; originalText: string }> = [];
		let match;
		while ((match = closingPcRegex.exec(newFullString)) !== null) {
			matches.push({ index: match.index, originalText: match[0] });
		}

		for (let i = matches.length - 1; i >= 0; i--) {
			const currentMatch = matches[i];
			const mapEntryIndex = i;

			const attr = dataRefEndMap[mapEntryIndex];

			if (attr && typeof attr.dataRefEnd !== "undefined") {
				const mappedValue = this.getMapValue(attr.dataRefEnd);
				const newTag = this.getNewTagString(
					currentMatch.originalText,
					attr.id,
					mappedValue,
					CTypeEnum.PC_CLOSE_DATA_REF,
					"_2",
				);

				newFullString =
					newFullString.substring(0, currentMatch.index) +
					newTag +
					newFullString.substring(
						currentMatch.index + currentMatch.originalText.length,
					);
			}
		}
		return newFullString;
	}

	public restore(originalString: string): string {
		if (this.map.size === 0) {
			return originalString;
		}

		let currentString = originalString;
		try {
			const adaptedNodes =
				this.parseXmlStringToAdaptedNodes(currentString);

			for (const node of adaptedNodes) {
				currentString = this.recursiveRestoreOriginalTags(
					node,
					currentString,
				);
			}
		} catch (e) {
			// If something fails, return the original string
		}
		return currentString;
	}

	private recursiveRestoreOriginalTags(
		node: AdaptedXmlNode,
		currentFullString: string,
	): string {
		let newFullString = currentFullString;

		if (node.has_children) {
			for (const childNode of node.inner_html) {
				newFullString = this.recursiveRestoreOriginalTags(
					childNode,
					newFullString,
				);
			}
		} else {
			const xOrig = this.getAttribute(node.attributes, "x-orig");
			if (!xOrig) {
				return newFullString;
			}

			const ctype = this.getAttribute(
				node.attributes,
				"ctype",
			) as CTypeEnum;

			const isLayer2 = [
				CTypeEnum.PH_DATA_REF,
				CTypeEnum.SC_DATA_REF,
				CTypeEnum.EC_DATA_REF,
				CTypeEnum.PC_OPEN_DATA_REF,
				CTypeEnum.PC_CLOSE_DATA_REF,
				CTypeEnum.PC_SELF_CLOSE_DATA_REF,
			].includes(ctype);

			if (isLayer2) {
				const originalTag = Buffer.from(xOrig, "base64").toString(
					"utf-8",
				);

				const escapedNodeString = node.nodeString.replace(
					/[.*+?^${}()|[\]\\]/g,
					"\\$&",
				);
				const regex = new RegExp(escapedNodeString);

				if (regex.test(newFullString)) {
					newFullString = newFullString.replace(regex, originalTag);
				}
			}
		}
		return newFullString;
	}

	private getNewTagString(
		actualNodeString: string,
		id: string | undefined,
		dataRefValue: string,
		ctype: CTypeEnum,
		upCountIdValue: string | null = null,
	): string {
		const newTagParts: string[] = ["<ph"];

		if (typeof id !== "undefined") {
			newTagParts.push(`id="${id}${upCountIdValue || ""}"`);
		}
		newTagParts.push(`ctype="${ctype}"`);
		newTagParts.push(
			`equiv-text="base64:${Buffer.from(dataRefValue).toString(
				"base64",
			)}"`,
		);
		newTagParts.push(
			`x-orig="${Buffer.from(actualNodeString).toString("base64")}"`,
		);

		return newTagParts.join(" ") + "/>";
	}

	private replaceNewTagString(
		actualNodeString: string,
		id: string | undefined,
		dataRefValue: string,
		ctype: CTypeEnum,
		originalFullString: string,
		upCountIdValue: string | null = "_1",
	): string {
		const newTag = this.getNewTagString(
			actualNodeString,
			id,
			dataRefValue,
			ctype,
			upCountIdValue,
		);

		if (originalFullString.includes(actualNodeString)) {
			return originalFullString.replace(actualNodeString, newTag);
		}
		return originalFullString;
	}
}