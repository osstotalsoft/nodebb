import { Context, Envelope, EnvelopeCustomizer } from './envelope'
import { SubscriptionOptions } from './subscriptionOptions'
import { Subscription } from './transport'

/**
 * Envelopes, serializes and publishes a message on a certain topic
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#publish
 */
export function publish<T>(
  topic: string,
  msg: T,
  ctx?: Context,
  envelopeCustomizer?: EnvelopeCustomizer,
): Promise<Envelope<T>>

/**
 * Subscribes a handler to a given topic, with the provided options
 * Deserializes the message before calling the handler
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#subscribe
 */
export function subscribe(
  topic: string,
  handler: (msg: any) => void,
  opts?: SubscriptionOptions,
): Promise<Subscription>

/**
 * Implements a form of request/response communication over messaging
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#request--response-over-messaging
 */
export function sendCommandAndReceiveEvent(
  topic: string,
  command: any,
  events: string[],
  ctx?: Context,
  timeoutMs?: number,
): Promise<[string, any]>
