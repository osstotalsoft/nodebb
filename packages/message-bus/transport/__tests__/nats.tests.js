const subscriptionOptions = require('../../subscriptionOptions')

let natsClient, natsTransport

const natsSubscription = {
  on: jest.fn((ev, cb) => {
    if (ev == 'ready') {
      setTimeout(cb, 100)
    }
  }),
}

const natsSubscriptionOptions = {
  setStartAt: jest.fn(),
  setDurableName: jest.fn(),
  setDeliverAllAvailable: jest.fn(),
}

const natsConnection = {
  on: jest.fn((ev, cb) => {
    if (ev == 'connect') {
      setTimeout(cb, 100)
    }
  }),
  publish: jest.fn((_topic, _msg, cb) => {
    setTimeout(() => {
      cb(null, 'ok')
    }, 100)
  }),
  subscribe: jest.fn(() => natsSubscription),
  subscriptionOptions: jest.fn(() => natsSubscriptionOptions),
}

describe('Nats tests', () => {
  beforeEach(() => {
    jest.resetModules()
    natsClient = require('node-nats-streaming')
    natsClient.connect.mockReturnValue(natsConnection)
    natsTransport = require('../nats')
  })

  test('connect', async () => {
    //arrange

    //act
    const result = await natsTransport.connect()

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(result).toBe(natsConnection)
  })

  test('concurent connect calls', async () => {
    //arrange

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
      expect(connection).toBe(natsConnection)
    }
    expect(natsClient.connect).toHaveBeenCalledTimes(1)
  })

  test('publish', async () => {
    //arrange
    const subject = 'subject'
    const msg = {}

    //act
    await natsTransport.publish(subject, msg)

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsConnection.publish).toHaveBeenCalled()
  })

  test('subscribe PUB_SUB', async () => {
    //arrange
    const subject = 'subject'
    const handler = jest.fn()

    //act
    await natsTransport.subscribe(
      subject,
      handler,
      subscriptionOptions.PUB_SUB,
    )

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsConnection.subscribe).toHaveBeenCalled()
    expect(natsSubscriptionOptions.setStartAt.mock.calls[0][0]).toBe(
      natsClient.StartPosition.NEW_ONLY,
    )
  })

  test('subscribe STREAM_PROCESSOR', async () => {
    //arrange
    const subject = 'subject'
    const handler = jest.fn()

    //act
    await natsTransport.subscribe(
      subject,
      handler,
      subscriptionOptions.STREAM_PROCESSOR,
    )

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsConnection.subscribe).toHaveBeenCalled()
    expect(natsSubscriptionOptions.setDurableName).toHaveBeenCalled()
    expect(
      natsSubscriptionOptions.setDeliverAllAvailable,
    ).toHaveBeenCalled()
  })
})
