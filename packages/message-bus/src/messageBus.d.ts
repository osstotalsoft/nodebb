import { Context, Envelope, EnvelopeCustomizer } from './envelope'
import SubscriptionOptions from './subscriptionOptions'
import { Subscription } from './transport'

export function publish<T>(
  topic: string,
  msg: T,
  ctx?: Context,
  envelopeCustomizer?: EnvelopeCustomizer,
): Promise<Envelope<T>>

export function subscribe(
  topic: string,
  handler: (msg: any) => void,
  opts?: SubscriptionOptions,
): Promise<Subscription>

export function sendCommandAndReceiveEvent(
  topic: string,
  command: any,
  events: string[],
  ctx?: Context,
  timeoutMs?: number,
): Promise<[string, any]>
