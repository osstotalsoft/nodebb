// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const mock = jest.createMockFromModule('@totalsoft/message-bus')
mock.transport = {
  nats: { connect: jest.fn().mockResolvedValue({ on: jest.fn() }) },
}

mock.messageBus = jest.fn(() => {
  const messageBusMock = {
    publish: jest.fn(),
    subscribe: jest.fn(),
    sendCommandAndReceiveEvent: jest.fn(),
    transport: mock.transport.nats,
  }
  messageBusMock.__mockSubscriptionOnce =
    function __mockSubscriptionOnce(...events) {
      const subscription = {
        unsubscribe: jest.fn(),
        on: jest.fn(),
      }

      messageBusMock.subscribe.mockImplementationOnce(
        (_topic, handler) => {
          events.forEach((ev, index) => {
            setTimeout(() => {
              handler(ev)
            }, 100 * (index + 1))
          })

          return Promise.resolve(subscription)
        },
      )
    }

  messageBusMock.__clearMocks = function __clearMocks() {
    messageBusMock.subscribe.mockClear()
  }

  return messageBusMock
})

module.exports = mock
