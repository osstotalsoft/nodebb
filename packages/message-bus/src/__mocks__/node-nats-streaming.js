const mock = jest.genMockFromModule('node-nats-streaming')
const subscriptionOptions = {
  setStartAt: jest.fn(),
  setDurableName: jest.fn(),
  setDeliverAllAvailable: jest.fn(),
}
const connection = {
  radu: 1,
  on: jest.fn((ev, cb) => {
    if (ev == 'connect') {
      setTimeout(cb, 100)
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

module.exports = mock
