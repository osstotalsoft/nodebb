import {
  MessagingHostMiddleware,
  MessagingHostContext,
} from '../messagingHost'

export interface MsgHandlers {
  [propName: string]: (ctx: MessagingHostContext) => Promise<void>
}

export function dispatcher(
  handlers: MsgHandlers,
): MessagingHostMiddleware
