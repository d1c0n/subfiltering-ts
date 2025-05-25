import { AbstractFilter } from './AbstractFilter';
import { Pipeline } from './commons/Pipeline';
import { FeatureSetInterface } from './contracts/FeatureSetInterface';
import { CtrlCharsPlaceHoldToAscii } from './filters/CtrlCharsPlaceHoldToAscii';
import { DataRefReplace } from './filters/DataRefReplace';
import { DataRefRestore } from './filters/DataRefRestore';
import { DollarCurlyBrackets } from './filters/DollarCurlyBrackets';
import { DoubleSquareBrackets } from './filters/DoubleSquareBrackets';
import { EmojiToEntity } from './filters/EmojiToEntity';
import { EncodeControlCharsInXliff } from './filters/EncodeControlCharsInXliff';
import { EncodeToRawXML } from './filters/EncodeToRawXML';
import { EntityToEmoji } from './filters/EntityToEmoji';
import { FromLayer2ToRawXML } from './filters/FromLayer2ToRawXML';
import { HtmlToPh } from './filters/HtmlToPh';
import { LtGtDecode } from './filters/LtGtDecode';
import { LtGtEncode } from './filters/LtGtEncode';
import { MateCatCustomPHToOriginalValue } from './filters/MateCatCustomPHToOriginalValue';
import { Percentages } from './filters/Percentages';
import { PercentNumberSnail } from './filters/PercentNumberSnail';
import { PlaceHoldXliffTags } from './filters/PlaceHoldXliffTags';
import { RemoveDangerousChars } from './filters/RemoveDangerousChars';
import { RestorePlaceHoldersToXLIFFLtGt } from './filters/RestorePlaceHoldersToXLIFFLtGt';
import { RestoreXliffTagsContent } from './filters/RestoreXliffTagsContent';
import { RubyOnRailsI18n } from './filters/RubyOnRailsI18n';
import { Snails } from './filters/Snails';
import { SpecialEntitiesToPlaceholdersForView } from './filters/SpecialEntitiesToPlaceholdersForView';
import { SplitPlaceholder } from './filters/SplitPlaceholder';
import { SprintfToPH } from './filters/SprintfToPH';
import { SquareSprintf } from './filters/SquareSprintf';
import { StandardPHToMateCatCustomPH } from './filters/StandardPHToMateCatCustomPH';
import { StandardXEquivTextToMateCatCustomPH } from './filters/StandardXEquivTextToMateCatCustomPH';
import { TwigToPh } from './filters/TwigToPh';
import { Variables } from './filters/Variables';

/**
 * Class Filter
 *
 * This class is meant to create subfiltering layers to allow data to be safely sent and received from 2 different Layers and real file
 *
 * # Definitions
 *
 * - Raw file, the real xml file in input, with data in XML
 * - Layer 0 is defined to be the Database. The data stored in the database should be in the same form ( sanitized if needed ) they comes from Xliff file
 * - Layer 1 is defined to be external services and resources, for example MT/TM server. This layer is different from layer 0, HTML subfiltering is applied here
 * - Layer 2 is defined to be the MayeCat UI.
 *
 * # Constraints
 * - We have to maintain the compatibility with PH tags placed inside the XLIff in the form <ph id="[0-9+]" equiv-text="<br/>"/>, those tags are placed into the database as XML
 * - HTML and other variables like android tags and custom features are placed into the database as encoded HTML <br/>
 *
 * - Data sent to the external services like MT/TM are sub-filtered:
 * -- <br/> become <ph id="mtc_[0-9]+" equiv-text="base64:Jmx0O2JyLyZndDs="/>
 * -- Existent tags in the XLIFF like <ph id="[0-9+]" equiv-text="<br/>"/> will leaved as is
 */
export class MateCatFilter extends AbstractFilter {
  /**
   * Used to transform database raw xml content ( Layer 0 ) to the UI structures ( Layer 2 )
   *
   * @param segment
   * @returns
   */
  public fromLayer0ToLayer2(segment: string): string {
    return this.fromLayer1ToLayer2(this.fromLayer0ToLayer1(segment));
  }

  /**
   * Used to transform database raw xml content ( Layer 0 ) to the UI structures ( Layer 2 )
   *
   * @param segment
   * @returns
   */
  public fromLayer1ToLayer2(segment: string): string {
    const channel = new Pipeline(this.source, this.target, this.dataRefMap);
    channel.addLast(new SpecialEntitiesToPlaceholdersForView());
    channel.addLast(new EntityToEmoji());
    channel.addLast(new DataRefReplace());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (this.featureSet as FeatureSetInterface).filter('fromLayer1ToLayer2', channel).transform(segment);
  }

  /**
   * Used to transform UI data ( Layer 2 ) to the XML structures ( Layer 1 )
   *
   * @param segment
   * @returns
   */
  public fromLayer2ToLayer1(segment: string): string {
    const channel = new Pipeline(this.source, this.target, this.dataRefMap);
    channel.addLast(new CtrlCharsPlaceHoldToAscii());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new FromLayer2ToRawXML());
    channel.addLast(new EmojiToEntity());
    channel.addLast(new RestoreXliffTagsContent());
    channel.addLast(new RestorePlaceHoldersToXLIFFLtGt());
    channel.addLast(new DataRefRestore());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (this.featureSet as FeatureSetInterface).filter('fromLayer2ToLayer1', channel).transform(segment);
  }

  /**
   * Used to transform the UI structures ( Layer 2 ) to allow them to be stored in database ( Layer 0 )
   *
   * It is assumed that the UI send strings having XLF tags not encoded and HTML in XML encoding representation:
   * - <b>de <ph id="mtc_1" equiv-text="base64:JTEkcw=="/>, <x id="1" /> </b>que
   *
   * @param segment
   * @returns
   */
  public fromLayer2ToLayer0(segment: string): string {
    return this.fromLayer1ToLayer0(this.fromLayer2ToLayer1(segment));
  }

  /**
   * Used to transform database raw xml content ( Layer 0 ) to the sub filtered structures, used for server to server ( Ex: TM/MT ) communications ( Layer 1 )
   *
   * @param segment
   * @returns
   */
  public fromLayer0ToLayer1(segment: string): string {
    const channel = new Pipeline(this.source, this.target, this.dataRefMap);
    channel.addLast(new StandardPHToMateCatCustomPH());
    channel.addLast(new StandardXEquivTextToMateCatCustomPH());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new LtGtDecode());
    channel.addLast(new HtmlToPh());
    channel.addLast(new Variables());
    channel.addLast(new TwigToPh());
    channel.addLast(new RubyOnRailsI18n());
    channel.addLast(new Snails());
    channel.addLast(new DoubleSquareBrackets());
    channel.addLast(new DollarCurlyBrackets());
    channel.addLast(new PercentNumberSnail());
    channel.addLast(new Percentages());
    channel.addLast(new SquareSprintf());
    channel.addLast(new SprintfToPH());
    channel.addLast(new RestoreXliffTagsContent());
    channel.addLast(new RestorePlaceHoldersToXLIFFLtGt());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (this.featureSet as FeatureSetInterface).filter('fromLayer0ToLayer1', channel).transform(segment);
  }

  /**
   * Used to transform external server raw xml content ( Ex: TM/MT ) to allow them to be stored in database ( Layer 0 ), used for server to server communications ( Layer 1 )
   *
   * @param segment
   * @returns
   */
  public fromLayer1ToLayer0(segment: string): string {
    const channel = new Pipeline(this.source, this.target, this.dataRefMap);
    channel.addLast(new MateCatCustomPHToOriginalValue());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new EncodeToRawXML());
    channel.addLast(new LtGtEncode());
    channel.addLast(new RestoreXliffTagsContent());
    channel.addLast(new RestorePlaceHoldersToXLIFFLtGt());
    channel.addLast(new SplitPlaceholder());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (this.featureSet as FeatureSetInterface).filter('fromLayer1ToLayer0', channel).transform(segment);
  }

  /**
   * Used to convert the raw XLIFF content from file to an XML for the database ( Layer 0 )
   *
   * @param segment
   * @returns
   */
  public fromRawXliffToLayer0(segment: string): string {
    const channel = new Pipeline(this.source, this.target, this.dataRefMap);
    channel.addLast(new RemoveDangerousChars());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new EncodeControlCharsInXliff());
    channel.addLast(new RestoreXliffTagsContent());
    channel.addLast(new RestorePlaceHoldersToXLIFFLtGt());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (this.featureSet as FeatureSetInterface).filter('fromRawXliffToLayer0', channel).transform(segment);
  }

  /**
   * Used to export Database XML string into TMX files as valid XML
   *
   * @param segment
   * @returns
   */
  public fromLayer0ToRawXliff(segment: string): string {
    const channel = new Pipeline(this.source, this.target, this.dataRefMap);
    channel.addLast(new RemoveDangerousChars());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new RestoreXliffTagsContent());
    channel.addLast(new RestorePlaceHoldersToXLIFFLtGt());
    channel.addLast(new LtGtEncode());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (this.featureSet as FeatureSetInterface).filter('fromLayer0ToRawXliff', channel).transform(segment);
  }

  /**
   * Used to align the tags when created from Layer 0 to Layer 1, when converting data from database is possible that html placeholders are in different positions
   * and their id are different because they are simple sequences.
   * We must place the right source tag ID in the corresponding target tags.
   *
   * The source holds the truth :D
   * realigns the target ids by matching the content of the base64.
   *
   * @see getSegmentsController in matecat
   *
   * @param source
   * @param target
   * @returns
   */
  public realignIDInLayer1(source: string, target: string): string {
    const pattern = /<ph id ?= ?[\"\'](mtc_[0-9]+)[\"\'] ?(equiv-text=[\"\'].+?[\"\'] ?)\/>/i;

    const srcTags: RegExpMatchArray[] = [];
    let match;
    const sourceRegex = new RegExp(pattern, 'gui');
    while ((match = sourceRegex.exec(source)) !== null) {
      srcTags.push(match);
    }

    const trgTags: RegExpMatchArray[] = [];
    const targetRegex = new RegExp(pattern, 'gui');
    while ((match = targetRegex.exec(target)) !== null) {
      trgTags.push(match);
    }

    if (srcTags.length !== trgTags.length) {
      // WRONG NUMBER OF TAGS, in the translation there is a tag mismatch, let the user fix it
      return target;
    }

    const notFoundTargetTags: { [key: number]: string } = {};
    let startOffset = 0;

    const srcEquivTexts = srcTags.map((tag) => tag[2]);
    const trgEquivTexts = trgTags.map((tag) => tag[2]);

    for (let trgTagPosition = 0; trgTagPosition < trgTags.length; trgTagPosition++) {
      const b64 = trgEquivTexts[trgTagPosition];
      const srcTagPosition = srcEquivTexts.indexOf(b64);

      if (srcTagPosition === -1) {
        // this means that the content of a tag is changed in the translation
        notFoundTargetTags[trgTagPosition] = b64;
        // eslint-disable-next-line no-continue
        continue;
      } else {
        srcEquivTexts[srcTagPosition] = ''; // Remove the index to allow indexOf to find the equal next one if it is present
      }

      // Replace ONLY ONE element AND the EXACT ONE
      const tagPositionInString = target.indexOf(trgTags[trgTagPosition][0], startOffset);
      if (tagPositionInString === -1) {
        // Should not happen if lengths match, but as a safeguard
        // eslint-disable-next-line no-continue
        continue;
      }

      target =
        target.substring(0, tagPositionInString) +
        srcTags[srcTagPosition][0] +
        target.substring(tagPositionInString + trgTags[trgTagPosition][0].length);

      startOffset = tagPositionInString + srcTags[srcTagPosition][0].length; // Set the next starting point
    }

    if (Object.keys(notFoundTargetTags).length > 0) {
      // Do something ?!? how to re-align if they are changed in value and changed in position?
      // For now, we just return the modified target.
    }

    return target;
  }
}