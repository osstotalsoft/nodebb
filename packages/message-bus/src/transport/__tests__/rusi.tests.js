// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { SubscriptionOptions } = require('../../subscriptionOptions')
const serDes = require('../../serDes')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}

describe('rusi tests', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('connect', async () => {
    //arrange
    const grpcMock = require('grpc')
    const rusiTransport = require('../rusi')

    //act
    const connection = await rusiTransport.connect()

    //assert
    expect(grpcMock.__rusiClientMock.waitForReady).toHaveBeenCalled()
    expect(connection._rusiClient).toBe(grpcMock.__rusiClientMock)
  })

  test('concurrent connect calls', async () => {
    //arrange
    const grpcMock = require('grpc')
    const rusiTransport = require('../rusi')

    //act
    const cnx = await Promise.all([
      rusiTransport.connect(),
      rusiTransport.connect(),
      rusiTransport.connect(),
      rusiTransport.connect(),
      rusiTransport.connect(),
      rusiTransport.connect(),
    ])

    //assert
    for (const connection of cnx) {
      expect(connection._rusiClient).toBe(grpcMock.__rusiClientMock)
    }
    expect(
      grpcMock.__rusiClientMock.waitForReady,
    ).toHaveBeenCalledTimes(1)
  })

  test('publish', async () => {
    //arrange
    const grpcMock = require('grpc')
    const rusiTransport = require('../rusi')
    const subject = 'subject'
    const envelope = { payload: {}, headers: {} }

    //act
    await rusiTransport.publish(subject, envelope, serDes)

    //assert
    expect(grpcMock.__rusiClientMock.waitForReady).toHaveBeenCalled()
    expect(grpcMock.__rusiClientMock.Publish).toHaveBeenCalled()
  })

  test('subscribe', async () => {
    //arrange
    const grpcMock = require('grpc')
    const rusiTransport = require('../rusi')

    const subject = 'subject'
    const handler = jest.fn()

    //act
    await rusiTransport.subscribe(
      subject,
      handler,
      SubscriptionOptions.PUB_SUB,
    )

    //assert
    expect(grpcMock.__rusiClientMock.waitForReady).toHaveBeenCalled()
    expect(grpcMock.__rusiClientMock.Subscribe).toHaveBeenCalled()
  })
})
