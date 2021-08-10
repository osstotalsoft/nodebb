// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const mock = jest.genMockFromModule('@totalsoft/message-bus')
mock.transport = {
  connect: jest.fn().mockResolvedValue({ on: jest.fn() }),
}

mock.__mockSubscriptionOnce = function __mockSubscriptionOnce(
  ...events
) {
  const subscription = {
    unsubscribe: jest.fn(),
    on: jest.fn(),
  }

  mock.subscribe.mockImplementationOnce((_topic, handler) => {
    events.forEach((ev, index) => {
      setTimeout(() => {
        handler(ev)
      }, 100 * (index + 1))
    })

    return Promise.resolve(subscription)
  })
}

mock.__clearMocks = function __clearMocks() {
  mock.subscribe.mockClear()
}

module.exports = mock
