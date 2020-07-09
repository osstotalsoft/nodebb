import {
  MessagingHost,
  MessagingHostMiddleware,
  MessagingHostContext,
} from './messagingHost'
import {
  correlation,
  dispatcher,
  exceptionHandling,
} from './middleware'
import { subscriptionOptions as SubscriptionOptions } from '@totalsoft/message-bus'

declare let messagingHost: {
  (): MessagingHost
  correlation: typeof correlation
  dispatcher: typeof dispatcher
  exceptionHandling: typeof exceptionHandling
  subscriptionOptions: SubscriptionOptions
}

export default messagingHost
export {
  MessagingHost,
  MessagingHostMiddleware,
  MessagingHostContext,
}
