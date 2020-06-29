const { serialize, deSerialize } = require('../serDes')

describe('SerDes tests', () => {
  test('deSerialize . serialize = identity', () => {
    //arrange
    const msg = {
      payload: {
        somethingId: 'some-id',
        somethingValue: 'some-value',
      },
      headers: {
        'nbb-correlationId': 'some-correlation-id',
        'nbb-source': 'some-source',
      },
    }

    //act
    const result = deSerialize(serialize(msg))

    //assert
    expect(result).toEqual(msg)
  })

  test('deSerialize should camelize payload only', () => {
    //arrange
    const msg = JSON.stringify({
      Payload: {
        SomethingId: 'some-id',
        SomethingValue: 'some-value',
      },
      Headers: {
        'nbb-correlationId': 'some-correlation-id',
        'nbb-source': 'some-source',
      },
    })

    //act
    const deserialized = deSerialize(msg)

    //assert
    expect(deserialized).toEqual({
      payload: {
        somethingId: 'some-id',
        somethingValue: 'some-value',
      },
      headers: {
        'nbb-correlationId': 'some-correlation-id',
        'nbb-source': 'some-source',
      },
    })
  })
})
