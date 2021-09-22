// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { SubscriptionOptions } = require('../../subscriptionOptions')
const serDes = require('../../serDes')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn()
}

describe('Nats tests', () => {
  beforeEach(() => {
    jest.resetModules()

    //natsClient.connect.mockReturnValue(natsConnection)
  })

  test('connect', async () => {
    //arrange
    const natsClient = require('node-nats-streaming')
    const natsTransport = require('../nats')

    //act
    const connection = await natsTransport.connect()

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(connection).toBe(natsClient.__connection)
  })

  test('connection errors are logged to console', async () => {
    //arrange
    const natsClient = require('node-nats-streaming')
    const natsTransport = require('../nats')
    const err = new Error("Nats client exception")

    //act
    await natsTransport.connect()
    natsClient.__emitConnectionError(err)


    //assert
    expect(global.console.error).toHaveBeenCalledWith(`Nats connection error: ${err}`)
  })

  test('concurent connect calls', async () => {
    //arrange
    const natsClient = require('node-nats-streaming')
    const natsTransport = require('../nats')

    //act
    const cnx = await Promise.all([
      natsTransport.connect(),
      natsTransport.connect(),
      natsTransport.connect(),
      natsTransport.connect(),
      natsTransport.connect(),
      natsTransport.connect(),
    ])

    //assert
    for (const connection of cnx) {
      expect(connection).toBe(natsClient.__connection)
    }
    expect(natsClient.connect).toHaveBeenCalledTimes(1)
  })

  test('publish', async () => {
    //arrange
    const natsClient = require('node-nats-streaming')
    const natsTransport = require('../nats')
    const subject = 'subject'
    const msg = {}

    //act
    await natsTransport.publish(subject, msg, serDes)

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsClient.__connection.publish).toHaveBeenCalled()
  })

  test('subscribe PUB_SUB', async () => {
    //arrange
    const natsClient = require('node-nats-streaming')
    const natsTransport = require('../nats')

    const subject = 'subject'
    const handler = jest.fn()

    //act
    await natsTransport.subscribe(
      subject,
      handler,
      SubscriptionOptions.PUB_SUB,
    )

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsClient.__connection.subscribe).toHaveBeenCalled()
    expect(
      natsClient.__subscriptionOptions.setStartAt.mock.calls[0][0],
    ).toBe(natsClient.StartPosition.NEW_ONLY)
  })

  test('subscribe STREAM_PROCESSOR', async () => {
    //arrange
    const natsClient = require('node-nats-streaming')
    const natsTransport = require('../nats')

    const subject = 'subject'
    const handler = jest.fn()

    //act
    await natsTransport.subscribe(
      subject,
      handler,
      SubscriptionOptions.STREAM_PROCESSOR,
    )

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsClient.__connection.subscribe).toHaveBeenCalled()
    expect(
      natsClient.__subscriptionOptions.setDurableName,
    ).toHaveBeenCalled()
    expect(
      natsClient.__subscriptionOptions.setDeliverAllAvailable,
    ).toHaveBeenCalled()
    expect(
      natsClient.__subscriptionOptions.setManualAckMode,
    ).toHaveBeenCalled()
  })
})
