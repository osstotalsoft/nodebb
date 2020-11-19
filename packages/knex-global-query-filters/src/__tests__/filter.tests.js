const Knex = require('knex')
const { registerFilter } = require('../filter')

describe('filter tests', () => {
  test('filter single select', async () => {
    //arrange
    const knex = Knex({
      client: 'mssql',
      connection: {},
    })
    knex.client.runner = () => ({
      run: jest.fn().mockResolvedValue({}),
    })

    const onSelect = jest.fn()
    const filter = jest.fn((_table) => ({
      onSelect,
    }))
    registerFilter(filter, knex)

    //act
    await knex.select('column1').from('table1 as tbl1')

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(onSelect).toHaveBeenCalledWith('tbl1', expect.anything())
  })
})
