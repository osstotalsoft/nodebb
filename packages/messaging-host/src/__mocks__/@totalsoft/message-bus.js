// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const EventEmitter = require('events')
const mock = jest.createMockFromModule('@totalsoft/message-bus')

mock.messageBus = jest.fn(() => {
  const connectionMock = new EventEmitter()

  const makeSubscriptionMock = () => {
    const subscriptionMock = new EventEmitter()
    subscriptionMock.unsubscribe = jest.fn().mockResolvedValue()
    return subscriptionMock
  }

  const messageBusMock = {
    publish: jest.fn(),
    subscribe: jest.fn().mockResolvedValue(makeSubscriptionMock()),
    sendCommandAndReceiveEvent: jest.fn(),
    transport: {
      connect: jest.fn().mockResolvedValue(connectionMock),
      disconnect: jest.fn().mockResolvedValue(),
    },
  }
  messageBusMock.__mockSubscriptionOnce = (...events) => {
    messageBusMock.subscribe.mockImplementationOnce(
      (_topic, handler) => {
        events.forEach((ev, index) => {
          setTimeout(() => {
            handler(ev)
          }, 100 * (index + 1))
        })

        return Promise.resolve(makeSubscriptionMock())
      },
    )
  }
  messageBusMock.__mockConnectionErrorOnce = (err) => {
    const connectionError = err || new Error('Connection error')
    messageBusMock.transport.connect.mockImplementationOnce(() =>
      Promise.reject(connectionError),
    )

    return messageBusMock
  }

  messageBusMock.__mockSuccessfulConnectionOnce = () => {
    messageBusMock.transport.connect.mockImplementationOnce(() =>
      Promise.resolve(connectionMock),
    )

    return messageBusMock
  }

  messageBusMock.__emitConnectionError = (err) => {
    const connectionError = err || new Error('Connection error')
    connectionMock.emit('error', connectionError)
  }

  messageBusMock.__clearMocks = () => {
    messageBusMock.subscribe.mockClear()
    messageBusMock.transport.connect.mockClear()
  }

  return messageBusMock
})

module.exports = mock
