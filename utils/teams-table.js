'use strict'

const sqlHelp = require('./sql-help')

class TeamsTable {
  constructor(connection) {
    this.connection = connection
  }

  /**
   * Get a team by team_id.
   */
  getById(team_id, callback) {
    team_id = parseInt(team_id)
    this.connection.query('select * from teams where team_id=?', [team_id], callback)
  }

  /**
   * Delete the specified team.
   */
  delete(team, callback) {
    this.connection.query('delete from teams where team_id=?', [team.team_id], callback)
  }
}

module.exports = TeamsTable
