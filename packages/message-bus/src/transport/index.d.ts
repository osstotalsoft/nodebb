import SubscriptionOptions from '../subscriptionOptions'

export interface Connection {}
export type MessageHandler = (msg: string) => void

export interface Subscription {
  unsubscribe: () => void
}

export function connect(): Promise<Connection>
export function publish(subject: string, msg: any): Promise<void>
export function subscribe(
  subject: string,
  handler: MessageHandler,
  opts: SubscriptionOptions,
): Promise<Subscription>
