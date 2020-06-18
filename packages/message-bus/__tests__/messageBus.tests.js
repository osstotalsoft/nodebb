jest.resetModules()
process.env.Messaging__TopicPrefix = ''

jest.mock('../transport')
const messageBus = require('../index')
const { publish, subscribe } = require('../transport')
const serDes = require('../serDes')
const headers = require('../headers')

const subscription = {
  unsubscribe: jest.fn(),
  on: jest.fn(),
}

const yieldsEvent = (_subject, handler) => {
  const msg = `{"payload":{},"headers":{"nbb-correlationId":"some-correlation-id"}}`
  setTimeout(() => {
    handler({
      getSequence: jest.fn(() => ''),
      getData: jest.fn(() => msg),
    })
  }, 100)
  return Promise.resolve(subscription)
}

const yieldsNoEvent = (_subject, _handler) => {
  return Promise.resolve(subscription)
}

describe('MessageBus tests', () => {
  beforeEach(() => {
    publish.mockReset()
    subscribe.mockReset()
    subscription.unsubscribe.mockReset()
  })

  test('sendCommandAndReceiveEvent when subscriptions yield events', async () => {
    //arrange
    publish.mockResolvedValue()
    subscribe
      .mockImplementationOnce(yieldsEvent)
      .mockImplementationOnce(yieldsNoEvent)

    //act
    const [
      topic,
    ] = await messageBus.sendCommandAndReceiveEvent(
      'topic-cmd',
      {},
      ['topic-ev1', 'topic-ev2'],
      { correlationId: 'some-correlation-id' },
    )

    //assert
    expect(topic).toBe('topic-ev1')
    expect(subscribe).toHaveBeenCalledTimes(2)
    expect(publish).toHaveBeenCalled()
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(2)
  })

  test('sendCommandAndReceiveEvent when subscriptions yield no events', async () => {
    //arrange
    publish.mockResolvedValue()
    subscribe
      .mockImplementationOnce(yieldsNoEvent)
      .mockImplementationOnce(yieldsNoEvent)

    //act
    const promise = messageBus.sendCommandAndReceiveEvent(
      'topic-cmd',
      {},
      ['topic-ev1', 'topic-ev2'],
      { correlationId: 'some-correlation-id' },
      100,
    )

    //assert
    await expect(promise).rejects.toEqual(
      new Error('Message timeout occured.'),
    )

    expect(subscribe).toHaveBeenCalledTimes(2)
    expect(publish).toHaveBeenCalled()
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(2)
  })

  test('publish without context', async () => {
    //arrange
    publish.mockResolvedValue()

    //act
    await messageBus.publish('topic', {})

    //assert
    expect(publish).toHaveBeenCalled()
  })

  test('publish with context', async () => {
    //arrange
    publish.mockResolvedValue()
    const ctx = {
      correlationId: 'some-correlation-id',
      tenant: {
        externalId: 'some-tenant-id',
      },
    }

    //act
    await messageBus.publish('topic', {}, ctx)

    //assert
    expect(publish).toHaveBeenCalled()
    const publishedMsg = serDes.deSerialize(publish.mock.calls[0][1])
    expect(publishedMsg.headers[headers.correlationId]).toBe(
      ctx.correlationId,
    )
    expect(publishedMsg.headers[headers.tenantId]).toBe(
      ctx.tenant.externalId,
    )
  })
})
