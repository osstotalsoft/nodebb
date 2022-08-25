// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const subscription = {
  unsubscribe: jest.fn().mockResolvedValue(),
  on: jest.fn(),
}

const mock = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  publish: jest.fn().mockResolvedValue(),
  subscribe: jest.fn(),
  subscription,
}

const yieldsMsg = (msg) => (_subject, handler, _options, serDes) => {
  setTimeout(() => {
    handler(serDes.deSerialize(msg))
  }, 100)
  return Promise.resolve(subscription)
}

const yieldsNoMsg = () => (_subject, _handler, _options, _serDes) => {
  return Promise.resolve(subscription)
}

mock.__mockSubscriptionOnce_YieldsMsg = (ev) => {
  mock.subscribe.mockImplementationOnce(yieldsMsg(ev))
}

mock.__mockSubscriptionOnce_YieldsNoMsg = () => {
  mock.subscribe.mockImplementationOnce(yieldsNoMsg())
}

mock.__resetMocks = () => {
  mock.publish.mockClear()
  mock.subscribe.mockReset()
  subscription.unsubscribe.mockClear()
  subscription.on.mockClear()
}

module.exports = mock
