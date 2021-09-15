// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

import { SubscriptionOptions } from '../subscriptionOptions'

export interface Connection {}
export type MessageHandler = (msg: string) => void

export interface Subscription {
  unsubscribe: () => Promise<void>
}

export interface Transport {
  connect(): Promise<Connection>
  disconnect(): Promise<void>
  publish(subject: string, msg: any): Promise<void>
  subscribe(
    subject: string,
    handler: MessageHandler,
    opts: SubscriptionOptions,
  ): Promise<Subscription>
}

export const nats: Transport
