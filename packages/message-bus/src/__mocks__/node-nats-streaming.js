const mock = jest.genMockFromModule('node-nats-streaming')
const subscriptionOptions = {
  setStartAt: jest.fn(),
  setDurableName: jest.fn(),
  setDeliverAllAvailable: jest.fn(),
}
const _connectionErrorHandlers = []
const connection = {
  on: jest.fn((ev, cb) => {
    if (ev == 'connect') {
      setTimeout(cb, 100)
    } else if (ev == 'error') {
      _connectionErrorHandlers.push(cb)
    }
  }),
  publish: jest.fn((_topic, _msg, cb) => {
    setTimeout(() => {
      cb(null, 'ok')
    }, 100)
  }),
  subscribe: jest.fn().mockReturnValue({
    on: jest.fn((ev, cb) => {
      if (ev == 'ready') {
        setTimeout(cb, 100)
      }
    }),
  }),
  subscriptionOptions: jest.fn().mockReturnValue(subscriptionOptions),
}

mock.connect.mockReturnValue(connection)

mock.__connection = connection
mock.__subscriptionOptions = subscriptionOptions
mock.__emitConnectionError = err =>  _connectionErrorHandlers.forEach(cb => cb(err))

module.exports = mock
