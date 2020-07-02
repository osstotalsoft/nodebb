const exceptionHandling = require('../exceptionHandling')
const messagingHost = require('../../messagingHost')

describe('exceptionHandling tests:', () => {
  it('should handle exceptions: ', async () => {
    //arrange
    const msg = {}
    const ctx = messagingHost()._contextFactory('topic1', msg)
    const next = async () => {
      throw new Error(`Error!`)
    }

    //act & assert
    await expect(exceptionHandling()(ctx, next)).resolves.toBe(
      undefined,
    )
  })
})
