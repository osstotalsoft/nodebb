// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

jest.resetModules()
process.env.Messaging__TopicPrefix = ''
jest.mock('../../../../message-bus/src/transport/nats')
const { deadLetterQueue } = require('../deadLetterQueue')

const dlqMock = { push: jest.fn(async () => { }) }
jest.mock('../deadLetterQueue')
deadLetterQueue.mockImplementation(() => dlqMock)

const { exceptionHandling } = require('../exceptionHandling')
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
    expect(dlqMock.push).toHaveBeenCalledTimes(1)
  })
})
