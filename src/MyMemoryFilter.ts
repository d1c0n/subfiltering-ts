import { AbstractFilter } from './AbstractFilter';
import { Pipeline } from './commons/Pipeline';
import { FeatureSetInterface } from './contracts/FeatureSetInterface';
import { DollarCurlyBrackets } from './filters/DollarCurlyBrackets';
import { DoubleSquareBrackets } from './filters/DoubleSquareBrackets';
import { EncodeToRawXML } from './filters/EncodeToRawXML';
import { HtmlToPh } from './filters/HtmlToPh';
import { LtGtDecode } from './filters/LtGtDecode';
import { LtGtEncode } from './filters/LtGtEncode';
import { MateCatCustomPHToOriginalValue } from './filters/MateCatCustomPHToOriginalValue';
import { Percentages } from './filters/Percentages';
import { PercentNumberSnail } from './filters/PercentNumberSnail';
import { PercentSnail } from './filters/PercentSnail';
import { PlaceHoldXliffTags } from './filters/PlaceHoldXliffTags';
import { RestorePlaceHoldersToXLIFFLtGt } from './filters/RestorePlaceHoldersToXLIFFLtGt';
import { RestoreXliffTagsContent } from './filters/RestoreXliffTagsContent';
import { RubyOnRailsI18n } from './filters/RubyOnRailsI18n';
import { SingleCurlyBracketsToPh } from './filters/SingleCurlyBracketsToPh';
import { SmartCounts } from './filters/SmartCounts';
import { Snails } from './filters/Snails';
import { SplitPlaceholder } from './filters/SplitPlaceholder';
import { SprintfToPH } from './filters/SprintfToPH';
import { SquareSprintf } from './filters/SquareSprintf';
import { StandardPHToMateCatCustomPH } from './filters/StandardPHToMateCatCustomPH';
import { StandardXEquivTextToMateCatCustomPH } from './filters/StandardXEquivTextToMateCatCustomPH';
import { TwigToPh } from './filters/TwigToPh';
import { Variables } from './filters/Variables';

/**
 * Class MyMemoryFilter
 *
 * Specific Filter class used by MyMemory
 *
 * Please note that this is the BASIC filter. To add specific filter functions use specific FeatureSet
 * (see MyMemorySubFilteringTest example)
 *
 * https://mymemory.translated.net/
 */
export class MyMemoryFilter extends AbstractFilter {
  /**
   * Used to transform database raw xml content ( Layer 0 ) to the sub filtered structures, used for server to server ( Ex: TM/MT ) communications ( Layer 1 )
   *
   * @param segment
   * @param cid
   * @returns
   */
  public fromLayer0ToLayer1(segment: string, cid: string | null = null): string {
    const channel = new Pipeline(this.source, this.target);
    channel.addLast(new StandardPHToMateCatCustomPH());
    channel.addLast(new StandardXEquivTextToMateCatCustomPH());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new LtGtDecode());
    channel.addLast(new HtmlToPh());
    channel.addLast(new Variables());
    channel.addLast(new TwigToPh());

    if (cid === 'airbnb') {
      channel.addLast(new SmartCounts());
    }

    channel.addLast(new RubyOnRailsI18n());
    channel.addLast(new Snails());
    channel.addLast(new DoubleSquareBrackets());
    channel.addLast(new DollarCurlyBrackets());

    if (cid === 'roblox') {
      channel.addLast(new SingleCurlyBracketsToPh());
    }

    if (cid === 'familysearch') {
      channel.remove(new TwigToPh());
      channel.addLast(new SingleCurlyBracketsToPh());
    }

    channel.addLast(new PercentSnail());
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
}