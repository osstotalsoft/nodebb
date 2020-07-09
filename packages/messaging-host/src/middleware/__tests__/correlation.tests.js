const { messagingHost } = require('../../messagingHost')
const { correlation } = require('../correlation')
const { envelope } = require('@totalsoft/message-bus')

describe('correlation tests:', () => {
  it('should set correlationId from received msg: ', async () => {
    //arrange
    const someCorrelationId = 'some-correlation-id'
    envelope.getCorrelationId.mockReturnValue(someCorrelationId)

    const msg = {}
    const ctx = messagingHost()._contextFactory('topic1', msg)
    const next = jest.fn().mockResolvedValue(undefined)

    //act
    await correlation()(ctx, next)

    //assert
    expect(ctx.correlationId).toBe(someCorrelationId)
  })
})
