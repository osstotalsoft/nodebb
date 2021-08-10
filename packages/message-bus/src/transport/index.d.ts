// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

import { SubscriptionOptions } from '../subscriptionOptions'

export interface Connection {}
export type MessageHandler = (msg: string) => void

export interface Subscription {
  unsubscribe: () => Promise<void>
}

export function connect(): Promise<Connection>
export function disconnect(): Promise<void>
export function publish(subject: string, msg: any): Promise<void>
export function subscribe(
  subject: string,
  handler: MessageHandler,
  opts: SubscriptionOptions,
): Promise<Subscription>
