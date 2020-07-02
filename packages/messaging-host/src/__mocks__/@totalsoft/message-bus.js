const mock = jest.genMockFromModule('@totalsoft/message-bus')

mock.messageBus.__mockSubscriptionOnce = function __mockSubscriptionOnce(
  ...events
) {
  const subscription = {
    unsubscribe: jest.fn(),
    on: jest.fn(),
  }

  mock.messageBus.subscribe.mockImplementationOnce((_topic, handler) => {
    events.forEach((ev, index) => {
      setTimeout(() => {
        handler(ev)
      }, 100 * (index + 1))
    })

    return Promise.resolve(subscription)
  })
}

mock.messageBus.__clearMocks = function __clearMocks() {
  mock.messageBus.subscribe.mockClear();
};

module.exports = mock
