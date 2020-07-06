import {
  MessagingHostMiddleware,
  MessagingHostContext,
} from '../messagingHost'

export interface MsgHandlers {
  [propName: string]: (ctx: MessagingHostContext) => Promise<void>
}

declare let dispatcher: {
  (handlers: MsgHandlers): MessagingHostMiddleware
  mergeHandlers: (msgHandlers: MsgHandlers[]) => MsgHandlers
}

export default dispatcher
