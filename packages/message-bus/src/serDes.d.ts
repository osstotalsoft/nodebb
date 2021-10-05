// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.
import { Envelope } from './envelope'

export interface SerDesInfo {
  contentType: string
}

export interface SerDes {
  serialize: (msg: any) => string
  deSerialize: (data: string) => Envelope<any>
  deSerializePayload: (payload: string) => any
  getInfo: () => SerDesInfo
}

declare const serDes: SerDes
export default serDes
