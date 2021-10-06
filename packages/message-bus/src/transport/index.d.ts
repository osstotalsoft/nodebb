// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

import { SubscriptionOptions } from '../subscriptionOptions'
import { Envelope } from '../envelope'
import { SerDes } from '../serDes'
import { EventEmitter } from 'events'

export type Connection = EventEmitter

export interface Subscription extends EventEmitter {
  unsubscribe: () => Promise<void>
}

export interface Transport {
  connect(): Promise<Connection>
  disconnect(): Promise<void>
  publish(
    subject: string,
    envelope: Envelope<any>,
    serDes: SerDes,
  ): Promise<void>
  subscribe(
    subject: string,
    handler: (envelope: Envelope<any>) => Promise<void>,
    opts: SubscriptionOptions,
    serDes: SerDes,
  ): Promise<Subscription>
}

export const nats: Transport
export const rusi: Transport
