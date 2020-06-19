let natsClient, natsTransport

const natsSubscription = {
  on: jest.fn((ev, cb) => {
    if (ev == 'ready') {
      setTimeout(cb, 100)
    }
  }),
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
  subscribe: jest.fn(() => {
    return natsSubscription
  }),
  subscriptionOptions: jest.fn(()=>({}))
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

  test('subscribe', async () => {
    //arrange
    const subject = 'subject'
    const handler = jest.fn()

    //act
    await natsTransport.subscribe(subject, handler)

    //assert
    expect(natsClient.connect).toHaveBeenCalled()
    expect(natsConnection.subscribe).toHaveBeenCalled()
  })
})
