import { MessagingHostMiddleware } from '../messagingHost'

/**
 * Exception handling middleware
 * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/messaging-host#built-in-exception-handling-middleware
 */
export default function exceptionHandling(): MessagingHostMiddleware
