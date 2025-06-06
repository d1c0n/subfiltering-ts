import { Pipeline } from '../../../src/commons/Pipeline';
import { SmartCounts } from '../../../src/filters/SmartCounts';
import { Variables } from '../../../src/filters/Variables';
import { BaseFeature } from './BaseFeature';

export class AirbnbFeature extends BaseFeature {

  public fromLayer0ToLayer1(channel: Pipeline): Pipeline {
    channel.addAfter(new Variables(), new SmartCounts());
    return channel;
  }
}