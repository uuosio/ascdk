/**
 * All Rights Reserved by Patract Labs.
 * @author liangqin.fan@gmail.com
 */

import { Codec, CompactInt } from "as-scale-codec";
import { Crypto } from "../primitives/crypto";
import { WriteBuffer } from "../primitives/writebuffer";
import { seal_deposit_event } from "as-contract-runtime";

const MAX_EVENT_TOPICS = 4; // Refer to `frame/contracts/src/schedule.rs` L464
/**
 * This is an abstract class to implements an Event type.
 * It is used by compiler.
 *
 * refer to `QuickStart.md` for more details about how to define an Event in contract.
 *
 * @export
 * @abstract
 * @class Event
 */
export abstract class Event {
  private _topics: Codec[];
  private _data: Codec[];

  protected index: u8;

  constructor() {
      this._topics = new Array<Codec>();
      this._data = new Array<Codec>();

      this.index = 0;
  }

  appendTopic<T extends Codec>(t: T): void {
      this._topics.push(t);
  }

  appendData<T extends Codec>(d: T): void {
      this._data.push(d);
  }

  abstract emit(): void;

  protected __prepare__(): void {
      // let it an empty block
  }

  protected __emit__(): void {
      assert(this._topics.length <= MAX_EVENT_TOPICS, "too many topics defined.");

      let topicsData = new Array<u8>();
      topicsData = topicsData.concat(new CompactInt(i64(this._topics.length)).toU8a());
      for (let i = 0; i < this._topics.length; i++) {
          let hash = Crypto.blake256(this._topics[i]).toU8a();
          topicsData = topicsData.concat(hash);
      }

      let datas = new Array<u8>();
      datas.push(this.index);

      for (let i = 0; i < this._data.length; i++) {
          let d = this._data[i].toU8a();
          datas = datas.concat(d);
      }

      assert(this._data.length !== 0, "invalid event defined.");

      const topicBuf = new WriteBuffer(topicsData);
      const dataBuf = new WriteBuffer(datas);

      seal_deposit_event(
          topicBuf.buffer,
          topicBuf.size,
          dataBuf.buffer,
          dataBuf.size
      );
  }
}
