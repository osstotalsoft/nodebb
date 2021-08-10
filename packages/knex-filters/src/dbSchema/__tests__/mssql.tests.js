// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const Knex = require('knex')
const mockDb = require('mock-knex')
const { buildTableHasColumnPredicate } = require('../mssql')

describe('mssql dbSchema tests', () => {
  test('buildTableHasColumnPredicate', async () => {
    //arrange
    var knex = Knex({
      client: 'mssql',
    })
    mockDb.mock(knex)
    var tracker = mockDb.getTracker()
    tracker.install()
    tracker.on('query', function checkResult(query) {
      if (
        query.method == 'raw' &&
        query.sql ==
          'select SCHEMA_NAME() as [schema], DB_NAME() as [db]'
      ) {
        query.response([
          {
            schema: 'dbo',
            db: 'MyDb',
          },
        ])
      } else {
        query.response([
          {
            table: 'MyTable',
            schema: 'dbo',
          },
        ])
      }
    })

    

    //act
    const predicate = await buildTableHasColumnPredicate(
        'TenantId',
        knex,
      )

    //assert
    expect(predicate('MyTable')).toBe(true)
    expect(predicate('OtherTable')).toBe(false)
    expect(predicate('[MyTable]')).toBe(true)
    expect(predicate('dbo.MyTable')).toBe(true)
    expect(predicate('[dbo].[MyTable]')).toBe(true)
    expect(predicate('[otherSchema].[MyTable]')).toBe(false)
    expect(predicate('[MyDb].[dbo].[MyTable]')).toBe(true)
    expect(predicate('MyDb.dbo.MyTable')).toBe(true)
    expect(predicate('OtherDb.dbo.MyTable')).toBe(false)
  })
})
