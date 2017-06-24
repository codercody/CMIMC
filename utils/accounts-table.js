'use strict'

const sqlHelp = require('./sql-help')

class AccountsTable {
  constructor(connection) {
    this.connection = connection
  }

  /**
   * Add account with specified values.
   */
  add(account, callback) {
    // build sql string and values array
    delete account.account_id // just in case
    var account_sql = sqlHelp.jsonToSQL(account)
    account_sql.sql = 'insert into accounts set ' + account_sql.sql
    this.connection.query(account_sql.sql, account_sql.values, callback)
  }

  /**
   * Find an account by email.
   */
  getByEmail(email, callback) {
    this.connection.query('select * from accounts where email=?',
                          [email], callback)
  }
}

module.exports = AccountsTable
