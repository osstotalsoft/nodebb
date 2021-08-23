// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

jest.resetModules()
process.env.Messaging__TopicPrefix = ''
jest.mock('../transport')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}

const messageBus = require('../messageBus')
const { publish, subscribe } = require('../transport')
const serDes = require('../serDes')
const { envelope } = require('../envelope')

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
      null,
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

  test('sendCommandAndReceiveEvent with envelopeCustomizer', async () => {
    //arrange
    publish.mockResolvedValue()
    subscribe
      .mockImplementationOnce(yieldsEvent)
      .mockImplementationOnce(yieldsNoEvent)

    const envelopeCustomizer = jest.fn((x) => x)

    //act
    const [topic] = await messageBus.sendCommandAndReceiveEvent(
      'topic-cmd',
      {},
      ['topic-ev1', 'topic-ev2'],
      { correlationId: 'some-correlation-id' },
      envelopeCustomizer,
    )

    //assert
    expect(topic).toBe('topic-ev1')
    expect(envelopeCustomizer).toHaveBeenCalled()
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
      tenantId: 'some-tenant-id',
    }

    //act
    await messageBus.publish('topic', {}, ctx)

    //assert
    expect(publish).toHaveBeenCalled()
    const publishedMsg = serDes.deSerialize(publish.mock.calls[0][1])
    expect(envelope.getCorrelationId(publishedMsg)).toBe(
      ctx.correlationId,
    )
    expect(envelope.getTenantId(publishedMsg)).toBe(ctx.tenantId)
  })
})
