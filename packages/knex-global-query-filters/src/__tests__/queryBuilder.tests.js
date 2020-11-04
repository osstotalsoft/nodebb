const Knex = require('knex')
const { addFilter } = require('../queryBuilder')
const R = require('ramda')

describe('first tests', () => {
    test('some test', () => {
        const dbConfig = {
            client: "mssql",
            connection: {
                // host: DB_HOST,
                // port: parseInt(DB_PORT),
                // user: DB_USER,
                // password: DB_PASSWORD,
                // database: DB_DATABASE,
                // options: {
                //     encrypt: true
                // }
            }
        }
        const dbInstance = Knex(dbConfig)
        const builder = R.applyTo(
            dbInstance.queryBuilder()
                .select("name")
                .from("sys.columns"),
            addFilter("tenantId", "1")
        )

        expect(builder).not.toBe(null)
    })
})

