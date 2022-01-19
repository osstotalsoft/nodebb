// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { knex } = require('knex')
const mockDb = require('mock-knex')
const { buildTableHasColumnPredicate } = require('../pg')
const R = require('ramda')

describe('postgreSql dbSchema tests', () => {
  test('buildTableHasColumnPredicate', async () => {
    //arrange
    var knexInstance = knex({
      client: 'pg',
    })
    mockDb.mock(knexInstance)
    var tracker = mockDb.getTracker()
    tracker.install()
    tracker.on('query', function checkResult(query) {
      if (
        query.method == 'raw' &&
        query.sql ==
          'select current_schema() as "schema", current_database() as "db"'
      ) {
        query.response({
          rows: [
            {
              schema: 'public',
              db: 'mydb',
            },
          ],
        })
      } else {
        query.response([
          {
            table: 'mytable',
            schema: 'public',
          },
        ])
      }
    })

    //act
    const predicate = await buildTableHasColumnPredicate(
      'TenantId',
      knexInstance,
    )

    //assert
    expect(predicate('MyTable')).toBe(true)
    expect(predicate('OtherTable')).toBe(false)
    expect(predicate('"MyTable"')).toBe(true)
    expect(predicate('public.MyTable')).toBe(true)
    expect(predicate('"public"."MyTable"')).toBe(true)
    expect(predicate('"otherSchema"."MyTable"')).toBe(false)
    expect(predicate('"MyDb"."public"."MyTable"')).toBe(true)
    expect(predicate('MyDb.public.MyTable')).toBe(true)
    expect(predicate('OtherDb.public.MyTable')).toBe(false)
  })

  it('Calls the expected queries:', async () => {
    //arrange
    const getDefaultsQuery =
      'select current_schema() as "schema", current_database() as "db"'
    const getTableListQuery =
      'select distinct "table_name" as "table", "table_schema" as "schema" from "information_schema"."columns" where "column_name" = $1'
    const spyListener = jest.fn()
    const callsPath = ['mock', 'calls']
    const getFirstCallQuery = R.path([...callsPath, 0, 0, 'sql'])
    const getSecondCallQuery = R.path([...callsPath, 1, 0, 'sql'])

    var knexInstance = knex({
      client: 'pg',
    })
    mockDb.mock(knexInstance)
    var tracker = mockDb.getTracker()
    tracker.install()
    tracker.on('query', spyListener)

    //act
    await buildTableHasColumnPredicate('TenantId', knexInstance)

    //assert
    expect(spyListener.mock.calls).toHaveLength(2)
    expect(getFirstCallQuery(spyListener)).toBe(getDefaultsQuery)
    expect(getSecondCallQuery(spyListener)).toBe(getTableListQuery)
  })
})
