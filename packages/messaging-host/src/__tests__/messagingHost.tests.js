// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

// eslint-disable-next-line node/no-extraneous-require
require('jest-extended')
const { messagingHost } = require('../messagingHost')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}

describe('MessagingHost tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  test('2 topics and 2 middlewares', async () => {
    //Arrange
    console.info = jest.fn()
    const msgHost = messagingHost()
    msgHost._messageBus.__mockSubscriptionOnce({
      headers: {},
      payload: {},
    })
    msgHost._messageBus.__mockSubscriptionOnce(/*no events*/)

    const firstMiddleware = jest.fn(async (_ctx, next) => {
      await next()
    })
    const secondMiddleware = jest.fn(async (_ctx, next) => {
      await next()
    })

    const topic1 = 'topic1'
    const topic2 = 'topic2'

    //Act
    await msgHost
      .subscribe([topic1, topic2])
      .use(firstMiddleware)
      .use(secondMiddleware)
      .start()

    jest.runAllTimers()

    //Assert
    expect(firstMiddleware).toHaveBeenCalledBefore(secondMiddleware)
    expect(firstMiddleware.mock.calls[0][0].received.topic).toBe(
      'topic1',
    ) //.toHaveProperty("topic", topic1)
    expect(firstMiddleware.mock.calls[0][0].received).toHaveProperty(
      'msg',
    )
    expect(secondMiddleware.mock.calls[0][0].received.topic).toBe(
      'topic1',
    )
    expect(secondMiddleware.mock.calls[0][0].received).toHaveProperty(
      'msg',
    )
  })

  test('start retries', async () => {
    //arrange
    const middleware = jest.fn(async (_ctx, next) => {
      await next()
    })
    const msgHost = messagingHost()
      //.onConnectionError(connErrHandler)
      .use(middleware)
      .subscribe(['topic'])

    msgHost._messageBus
      .__mockConnectionErrorOnce()
      .__mockSuccessfulConnectionOnce()

    //act
    setImmediate(jest.runAllTimers)
    await msgHost.start()

    //assert
    expect(
      msgHost._messageBus.transport.connect,
    ).toHaveBeenCalledTimes(2)
  })

  test('connection error handler', async () => {
    //arrange
    const middleware = jest.fn(async (_ctx, next) => {
      await next()
    })
    const connectionErrorHandler = jest.fn()
    const msgHost = messagingHost()
      .onConnectionError(connectionErrorHandler)
      .use(middleware)
      .subscribe(['topic'])

    //act
    await msgHost.start()
    msgHost._messageBus.__emitConnectionError()

    //assert
    expect(connectionErrorHandler).toHaveBeenCalled()
  })

  test('connection error retries', async () => {
    //arrange
    const middleware = jest.fn(async (_ctx, next) => {
      await next()
    })
    const msgHost = messagingHost()
      .use(middleware)
      .subscribe(['topic'])

    msgHost._messageBus
      .__mockSuccessfulConnectionOnce()
      .__mockConnectionErrorOnce()
    //.__mockSuccessfulConnectionOnce()

    //act
    await msgHost.start()

    msgHost._messageBus.__emitConnectionError()
    await new Promise((resolve) => {
      msgHost.on('starting', resolve)
    })

    //assert
    expect(
      msgHost._messageBus.transport.connect,
    ).toHaveBeenCalledTimes(2)
  })

  test('isRunning returns true when the messaging host is started', async () => {
    const msgHost = messagingHost().subscribe(['topic'])

    // Act
    await msgHost.start()

    // Assert
    expect(msgHost.isRunning()).toBe(true)

    // Teardown: Stop the messaging host.
    await msgHost.stop()
  })

  test('isRunning returns false when the messaging host is stopped', async () => {
    const msgHost = messagingHost().subscribe(['topic'])

    // Act: Ensure the messaging host is stopped.
    await msgHost.start()
    await msgHost.stop()

    // Assert
    expect(msgHost.isRunning()).toBe(false)
  })
})
