// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { exceptionHandling } = require('../exceptionHandling')
const { messageBus } = require('@totalsoft/message-bus')

const busMock = { publish: jest.fn(async () => { }) }
jest.mock('@totalsoft/message-bus')
messageBus.mockImplementation(() => busMock)

const { messagingHost } = require('../../messagingHost')

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn()
}

describe('exceptionHandling tests:', () => {
  it('should handle exceptions:', async () => {
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

  it('should push an error message to dlq:', async () => {
    //arrange
    const msg = {}
    const ctx = messagingHost()._contextFactory('topic1', msg)

    const next = async () => {
      throw new Error(`Error!`)
    }

    //act
    exceptionHandling()(ctx, next)

    //assert
    expect(busMock.publish).toHaveBeenCalledTimes(1)
  })
})
