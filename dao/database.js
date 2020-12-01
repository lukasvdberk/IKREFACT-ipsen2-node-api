const { Client } = require('pg')

module.exports = class Database {
  /**
 * Pass a SQL query to execute on the database
 * @function example executeSQLStatement('SELECT $1::text as name', ['brianc'])
 * @param {string} sqlStatement - SQL statement filled with prepared statement.
 * To replace values (for inserts) with your own set $1::text in the SQL query (replace $1 with the number of the arguemnt)
 * @param {args} ...args - You can pass as many arguments as you want to be set in the SQL prepare statement.
 * @returns {Object} SQL Object from postgreSQL
 */
  static async executeSQLStatement (sqlStatement, ...args) {
    try {
      const connection = await this.setupConnection()

      await connection.connect()

      const queryResult = await connection.query(sqlStatement, args)
      // TODO add logging
      connection.end()

      return queryResult
    } catch (exception) {
      console.log(exception)
    }
  }

  static setupConnection () {
    return new Client({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USERNAME,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      port: process.env.SQL_PORT
    })
  }
}

// Example
// Database.executeSQLStatement('select * from test').then((queryResult) => {
//   console.log(queryResult)
// })
