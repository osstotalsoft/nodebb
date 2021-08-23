// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

export enum SubscriptionOptions {
  /**
   * Event driven subscriptions: durable, at-least-once, within a queue group
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#subscription--options
   */
  STREAM_PROCESSOR = 0,
  /**
   * Pub sub subscriptions: lite weight, non-durable, at-most-once, within a queue group
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#subscription--options
   */
  PUB_SUB,
  /**
   * RPC subscriptions: lite weight, non-durable, at-most-once, without queue group
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#subscription--options
   */
  RPC,
}
