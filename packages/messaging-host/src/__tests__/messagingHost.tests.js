// eslint-disable-next-line node/no-extraneous-require
require('jest-extended')
const { messagingHost } = require('../messagingHost')
const messageBus = require('@totalsoft/message-bus')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn()
}

describe('MessagingHost tests', () => {
  beforeEach(() => {
    messageBus.__clearMocks()
    jest.useFakeTimers()
  })

  test('2 topics and 2 middlewares', async () => {
    //Arrange
    console.info = jest.fn()
    messageBus.__mockSubscriptionOnce({ headers: {}, payload: {} })
    messageBus.__mockSubscriptionOnce(/*no events*/)

    const firstMiddleware = jest.fn(async (_ctx, next) => {
      await next()
    })
    const secondMiddleware = jest.fn(async (_ctx, next) => {
      await next()
    })

    const topic1 = 'topic1'
    const topic2 = 'topic2'

    //Act
    await messagingHost()
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
})
