import {
  MessagingHostMiddleware,
  MessagingHostContext,
} from '../messagingHost'

export interface MsgHandlers {
  [propName: string]: (ctx: MessagingHostContext) => Promise<void>
}

/**
 * Message dispatcher middleware
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/messaging-host#built-in-dispatcher-middleware
 */
export let dispatcher: {
  (handlers: MsgHandlers): MessagingHostMiddleware
  mergeHandlers: (msgHandlers: MsgHandlers[]) => MsgHandlers
}
