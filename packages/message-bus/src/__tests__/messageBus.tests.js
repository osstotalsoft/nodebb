// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

jest.resetModules()
process.env.Messaging__TopicPrefix = ''
jest.mock('../transport/nats')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}

const { messageBus, useTransport } = require('../messageBus')
const natsTransportMock = require('../transport/nats')
const serDes = require('../serDes')
const { envelope } = require('../envelope')

describe('MessageBus tests', () => {
  beforeEach(() => {
    natsTransportMock.__resetMocks()
  })

  test('sendCommandAndReceiveEvent when subscriptions yield events', async () => {
    //arrange
    const msg = `{"payload":{},"headers":{"nbb-correlationId":"some-correlation-id"}}`
    natsTransportMock.__mockSubscriptionOnce_YieldsMsg(msg)
    natsTransportMock.__mockSubscriptionOnce_YieldsNoMsg()

    const msgBus = messageBus()
    //act
    const [topic] = await msgBus.sendCommandAndReceiveEvent(
      'topic-cmd',
      {},
      ['topic-ev1', 'topic-ev2'],
      { correlationId: 'some-correlation-id' },
    )

    //assert
    expect(topic).toBe('topic-ev1')
    expect(natsTransportMock.subscribe).toHaveBeenCalledTimes(2)
    expect(natsTransportMock.publish).toHaveBeenCalled()
    expect(
      natsTransportMock.subscription.unsubscribe,
    ).toHaveBeenCalledTimes(2)
  })

  test('sendCommandAndReceiveEvent when subscriptions yield no events', async () => {
    //arrange
    natsTransportMock.__mockSubscriptionOnce_YieldsNoMsg()
    natsTransportMock.__mockSubscriptionOnce_YieldsNoMsg()

    const msgBus = messageBus()

    //act
    const promise = msgBus.sendCommandAndReceiveEvent(
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

    expect(natsTransportMock.subscribe).toHaveBeenCalledTimes(2)
    expect(natsTransportMock.publish).toHaveBeenCalled()
    expect(
      natsTransportMock.subscription.unsubscribe,
    ).toHaveBeenCalledTimes(2)
  })

  test('sendCommandAndReceiveEvent with envelopeCustomizer', async () => {
    //arrange
    const msg = `{"payload":{},"headers":{"nbb-correlationId":"some-correlation-id"}}`
    natsTransportMock.__mockSubscriptionOnce_YieldsMsg(msg)
    natsTransportMock.__mockSubscriptionOnce_YieldsNoMsg()

    const envelopeCustomizer = jest.fn((x) => x)
    const msgBus = messageBus()

    //act
    const [topic] = await msgBus.sendCommandAndReceiveEvent(
      'topic-cmd',
      {},
      ['topic-ev1', 'topic-ev2'],
      { correlationId: 'some-correlation-id' },
      envelopeCustomizer,
    )

    //assert
    expect(topic).toBe('topic-ev1')
    expect(envelopeCustomizer).toHaveBeenCalled()
    expect(natsTransportMock.subscribe).toHaveBeenCalledTimes(2)
    expect(natsTransportMock.publish).toHaveBeenCalled()
    expect(
      natsTransportMock.subscription.unsubscribe,
    ).toHaveBeenCalledTimes(2)
  })

  test('publish without context', async () => {
    //arrange
    const msgBus = messageBus()

    //act
    await msgBus.publish('topic', {})

    //assert
    expect(natsTransportMock.publish).toHaveBeenCalled()
  })

  test('publish with context', async () => {
    //arrange
    const ctx = {
      correlationId: 'some-correlation-id',
      tenantId: 'some-tenant-id',
    }
    const msgBus = messageBus()

    //act
    await msgBus.publish('topic', {}, ctx)

    //assert
    expect(natsTransportMock.publish).toHaveBeenCalled()
    const publishedMsg = serDes.deSerialize(
      natsTransportMock.publish.mock.calls[0][1],
    )
    expect(envelope.getCorrelationId(publishedMsg)).toBe(
      ctx.correlationId,
    )
    expect(envelope.getTenantId(publishedMsg)).toBe(ctx.tenantId)
  })

  test('useTransport', async () => {
    //arrange
    const transport1 = {
    }

    const transport2 = {
    }

    //act
    useTransport(transport1)
    const msgBus = messageBus()
    useTransport(transport2)


    //assert
    expect(msgBus.transport).toBe(transport1)
  })
})
