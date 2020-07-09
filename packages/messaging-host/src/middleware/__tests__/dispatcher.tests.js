const { dispatcher } = require('../dispatcher')
const { messagingHost } = require('../../messagingHost')

describe('dispatcher tests:', () => {
  it('should dispatch msg: ', async () => {
    //arrange
    const msg = {}
    const ctx = messagingHost()._contextFactory('topic1', msg)
    const next = jest.fn().mockResolvedValue(undefined)
    const cfg = {
      topic1: jest.fn().mockResolvedValue(undefined),
      otherTopic: jest.fn().mockResolvedValue(undefined),
    }

    //act
    await dispatcher(cfg)(ctx, next)

    //assert
    expect(cfg.topic1).toHaveBeenCalled()
    expect(cfg.otherTopic).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
