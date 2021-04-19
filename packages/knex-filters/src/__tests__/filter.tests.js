const Knex = require('knex')
const mockDb = require('mock-knex')
const MSSQLMockKnex = require('../__mocks/MSSQLMockKnex')

const { registerFilter } = require('../filter')

describe('filter tests', () => {
  test('select from single table', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
    }
    const filter = jest.fn(() => {
      return hooks
    })
    registerFilter(filter, knex)

    const advancedHooks = {
      onSelect: {
        from: jest.fn(),
      },
    }
    const advancedFilter = jest.fn(() => {
      return advancedHooks
    })
    registerFilter(advancedFilter, knex)

    //act
    await knex.select('column1').from('table1 as tbl1')
    await knex.select('column2').from('table2')
    await knex.select('column3').from('[table3] as tbl3')
    await knex.select('column4').from('[dbo].[table4]')
    await knex.select('column5').from('dbo.table5 as tbl5')

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(advancedFilter).toHaveBeenCalledWith('table1')

    expect(filter).toHaveBeenCalledWith('table2')
    expect(advancedFilter).toHaveBeenCalledWith('table2')

    expect(filter).toHaveBeenCalledWith('table3')
    expect(advancedFilter).toHaveBeenCalledWith('table3')

    expect(filter).toHaveBeenCalledWith('dbo.table4')
    expect(advancedFilter).toHaveBeenCalledWith('dbo.table4')

    expect(filter).toHaveBeenCalledWith('dbo.table5')
    expect(advancedFilter).toHaveBeenCalledWith('dbo.table5')

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      'tbl1',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.from).toHaveBeenCalledWith(
      'table1',
      'tbl1',
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table2',
      undefined,
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.from).toHaveBeenCalledWith(
      'table2',
      undefined,
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table3',
      'tbl3',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.from).toHaveBeenCalledWith(
      'table3',
      'tbl3',
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table4',
      undefined,
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.from).toHaveBeenCalledWith(
      'dbo.table4',
      undefined,
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table5',
      'tbl5',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.from).toHaveBeenCalledWith(
      'dbo.table5',
      'tbl5',
      expect.anything(),
      expect.anything(),
    )
  })

  test('select with join', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    const advancedHooks = {
      onSelect: {
        from: jest.fn(),
        innerJoin: jest.fn(),
        leftJoin: jest.fn(),
        rightJoin: jest.fn(),
        fullOuterJoin: jest.fn(),
        crossJoin: jest.fn(),
      },
    }
    const advancedFilter = jest.fn(() => {
      return advancedHooks
    })
    registerFilter(advancedFilter, knex)

    //act
    await knex
      .select('tbl1.column1', 'tbl2.column2')
      .from('table1 as tbl1')
      .innerJoin('table2 as tbl2', 'tbl1.column1', 'tbl2.column2')
      .leftOuterJoin(
        'dbo.table3',
        'tbl1.column1',
        'dbo.table3.column3',
      )
      .rightJoin(
        '[dbo].[table4]',
        'tbl1.column1',
        '[dbo].[table4].[column4]',
      )
      .fullOuterJoin(
        '[dbo].[table5] as tbl5',
        'tbl1.column1',
        'tbl5.column5',
      )
      .crossJoin('[dbo].[table6] as tbl6')

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(advancedFilter).toHaveBeenCalledWith('table1')

    expect(filter).toHaveBeenCalledWith('table2')
    expect(advancedFilter).toHaveBeenCalledWith('table2')

    expect(filter).toHaveBeenCalledWith('dbo.table3')
    expect(advancedFilter).toHaveBeenCalledWith('dbo.table3')

    expect(filter).toHaveBeenCalledWith('dbo.table4')
    expect(advancedFilter).toHaveBeenCalledWith('dbo.table4')

    expect(filter).toHaveBeenCalledWith('dbo.table5')
    expect(advancedFilter).toHaveBeenCalledWith('dbo.table5')

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      'tbl1',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.from).toHaveBeenCalledWith(
      'table1',
      'tbl1',
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table2',
      'tbl2',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.innerJoin).toHaveBeenCalledWith(
      'table2',
      'tbl2',
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table3',
      undefined,
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.leftJoin).toHaveBeenCalledWith(
      'dbo.table3',
      undefined,
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table4',
      undefined,
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.rightJoin).toHaveBeenCalledWith(
      'dbo.table4',
      undefined,
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table5',
      'tbl5',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.fullOuterJoin).toHaveBeenCalledWith(
      'dbo.table5',
      'tbl5',
      expect.anything(),
      expect.anything(),
    )

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table6',
      'tbl6',
      expect.anything(),
      expect.anything(),
    )
    expect(advancedHooks.onSelect.crossJoin).toHaveBeenCalledWith(
      'dbo.table6',
      'tbl6',
      expect.anything(),
      expect.anything(),
    )
  })

  test('insert', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onInsert: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    const table1row = { column1: 'column1' }
    await knex('table1').insert(table1row)
    const table2rows = [{ column2: 'value1' }, { column2: 'value2' }]
    await knex('table2').insert(table2rows)

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(filter).toHaveBeenCalledWith('table2')

    expect(hooks.onInsert).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
      table1row,
    )
    expect(hooks.onInsert).toHaveBeenCalledWith(
      'table2',
      undefined,
      expect.anything(),
      table2rows[0],
    )
    expect(hooks.onInsert).toHaveBeenCalledWith(
      'table2',
      undefined,
      expect.anything(),
      table2rows[1],
    )
  })

  test('update', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onUpdate: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    const table1Updates = { column1: 'value1' }
    await knex('table1').update(table1Updates)

    const table2Updates = { column2: 'value2' }
    await knex('dbo.table2 as tbl2').update(table2Updates)

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(filter).toHaveBeenCalledWith('dbo.table2')

    expect(hooks.onUpdate).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
      table1Updates,
    )
    expect(hooks.onUpdate).toHaveBeenCalledWith(
      'dbo.table2',
      'tbl2',
      expect.anything(),
      table2Updates,
    )
  })

  test('delete', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onDelete: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    await knex('table1').del()
    await knex('dbo.table2 as tbl2').del()

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(filter).toHaveBeenCalledWith('dbo.table2')

    expect(hooks.onDelete).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
    )
    expect(hooks.onDelete).toHaveBeenCalledWith(
      'dbo.table2',
      'tbl2',
      expect.anything(),
    )
  })

  test('transaction', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    MSSQLMockKnex.client.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
      onInsert: jest.fn(),
      onUpdate: jest.fn(),
      onDelete: jest.fn(),
    }

    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    const insertedRow = { column1: 'value1' }
    const updates = { column1: 'value2' }

    //act
    await knex.transaction(async (trx) => {
      await trx.select('column1').from('table1 as tbl1')

      await trx('table2').insert(insertedRow)

      await trx('dbo.table3').update(updates)

      await trx('dbo.table4 as tbl4').del()
    })

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      'tbl1',
      expect.anything(),
      expect.anything(),
    )

    expect(filter).toHaveBeenCalledWith('table2')
    expect(hooks.onInsert).toHaveBeenCalledWith(
      'table2',
      undefined,
      expect.anything(),
      insertedRow,
    )

    expect(filter).toHaveBeenCalledWith('dbo.table3')
    expect(hooks.onUpdate).toHaveBeenCalledWith(
      'dbo.table3',
      undefined,
      expect.anything(),
      updates,
    )

    expect(filter).toHaveBeenCalledWith('dbo.table4')
    expect(hooks.onDelete).toHaveBeenCalledWith(
      'dbo.table4',
      'tbl4',
      expect.anything(),
    )
  })

  test('count', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    await knex('table1').count('column1', { as: 'c1' })
    await knex('dbo.table2').count('column2')
    await knex('table3 as tbl3')
      .join('table4 as tbl4', 'tbl3.column3', 'tbl4.column4')
      .count()

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(filter).toHaveBeenCalledWith('dbo.table2')
    expect(filter).toHaveBeenCalledWith('table3')
    expect(filter).toHaveBeenCalledWith('table4')

    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
      expect.anything(),
    )
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'dbo.table2',
      undefined,
      expect.anything(),
      expect.anything(),
    )
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table3',
      'tbl3',
      expect.anything(),
      expect.anything(),
    )
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table4',
      'tbl4',
      expect.anything(),
      expect.anything(),
    )
  })

  test('count modify first', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    await knex
      .count('column1', { as: 'c1' })
      .modify((queryBuilder) => {
        queryBuilder.from('table1')
      })
      .first()

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
      expect.anything(),
    )
  })

  test('first', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    await knex.table('table1').first('id', 'name')

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
      expect.anything(),
    )
  })

  test('min', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)

    const hooks = {
      onSelect: jest.fn(),
    }
    const filter = jest.fn(() => hooks)
    registerFilter(filter, knex)

    //act
    await knex('table1').min('id')

    //assert
    expect(filter).toHaveBeenCalledWith('table1')
    expect(hooks.onSelect).toHaveBeenCalledWith(
      'table1',
      undefined,
      expect.anything(),
      expect.anything(),
    )
  })
})
