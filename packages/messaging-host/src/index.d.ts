import { MessagingHost } from './messagingHost'
import {
  correlation,
  dispatcher,
  exceptionHandling,
} from './middleware'

declare let messagingHost: {
  (): MessagingHost
  correlation: typeof correlation
  dispatcher: typeof dispatcher
  exceptionHandling: typeof exceptionHandling
}

export default messagingHost
