// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const subscription = {
  unsubscribe: jest.fn(),
  on: jest.fn(),
}

const mock = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  publish: jest.fn().mockResolvedValue(),
  subscribe: jest.fn(),
  subscription,
}

const yieldsMsg = (msg) => (_subject, handler) => {
  setTimeout(() => {
    handler({
      getSequence: jest.fn(() => ''),
      getData: jest.fn(() => msg),
    })
  }, 100)
  return Promise.resolve(subscription)
}

const yieldsNoMsg = () => (_subject, _handler) => {
  return Promise.resolve(subscription)
}

mock.__mockSubscriptionOnce_YieldsMsg = (ev) => {
  mock.subscribe.mockImplementationOnce(yieldsMsg(ev))
}

mock.__mockSubscriptionOnce_YieldsNoMsg = () => {
  mock.subscribe.mockImplementationOnce(yieldsNoMsg())
}

mock.__resetMocks = () => {
  mock.publish.mockReset()
  mock.subscribe.mockReset()
  subscription.unsubscribe.mockReset()
  subscription.on.mockReset()
}

module.exports = mock
