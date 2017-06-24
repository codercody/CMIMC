'use strict'

const sqlHelp = require('./sql-help')

class TeamsTable {
  constructor(connection) {
    this.connection = connection
  }

  /**
   * Add team with specified fields.
   */
  add(team, callback) {
    // build sql string and values array
    delete team.team_id // just in case
    var team_sql = sqlHelp.jsonToSQL(team)
    team_sql.sql = 'insert into teams set ' + team_sql.sql
    this.connection.query(team_sql.sql, team_sql.values, callback)
  }
  /**
   * Update team with specified fields.
   */
  update(team, callback) {
    // build sql string and values array
    var team_id = team.team_id
    delete team.team_id
    var team_sql = sqlHelp.jsonToSQL(team)
    team_sql.sql = 'update teams set ' + team_sql.sql + ' where team_id=?'
    team_sql.values.push(team_id)
    this.connection.query(team_sql.sql, team_sql.values, callback)
  }
  /**
   * Get a team by team_id.
   */
  getById(team_id, callback) {
    team_id = parseInt(team_id)
    this.connection.query('select * from teams where team_id=?', [team_id], callback)
  }
  /**
   * Get all teams for an account_id.
   */
  getByAccountId(account_id, callback) {
    account_id = parseInt(account_id)
    this.connection.query('select * from teams where account_id=?', account_id, callback)
  }
  /**
   * Delete the specified team.
   */
  delete(team, callback) {
    this.connection.query('delete from teams where team_id=?', [team.team_id], callback)
  }
}

module.exports = TeamsTable
