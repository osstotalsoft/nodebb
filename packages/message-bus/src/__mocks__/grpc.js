// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.
const EventEmitter = require('events')

const channelMock = {
  watchConnectivityState: jest.fn(),
}

const rusiClientMock = {
  waitForReady: jest.fn((deadline, cb) => {
    setTimeout(cb, 10)
  }),
  getChannel: jest.fn(() => channelMock),
  Publish: jest.fn((req, cb) => {
    setTimeout(cb, 10)
  }),
  Subscribe: jest.fn((_req) => {
    const sub = new EventEmitter()
    sub.cancel = jest.fn()
    return sub
  }),
}

const mock = jest.createMockFromModule('grpc')
mock.loadPackageDefinition = jest.fn(() => {
  const result = {
    rusi: {
      proto: {
        runtime: {
          v1: {
            Rusi: jest.fn(() => rusiClientMock),
          },
        },
      },
    },
  }
  return result
})
mock.__rusiClientMock = rusiClientMock
mock.__channelMock = channelMock

module.exports = mock
