import {
  MessagingHostMiddleware,
  MessagingHostContext,
} from '../messagingHost'

export interface MsgHandlers {
  [propName: string]: (ctx: MessagingHostContext) => Promise<void>
}

export default function dispatcher(
  handlers: MsgHandlers,
): MessagingHostMiddleware
