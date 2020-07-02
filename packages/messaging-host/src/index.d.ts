import { MessagingHost } from './messagingHost'
import {
  correlation,
  dispatcher,
  exceptionHandling,
} from './middleware'

export let messagingHost: {
  (): MessagingHost
  correlation: typeof correlation
  dispatcher: typeof dispatcher
  exceptionHandling: typeof exceptionHandling
}
