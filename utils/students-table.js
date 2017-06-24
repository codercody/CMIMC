'use strict'

const sqlHelp = require('./sql-help')

class StudentsTable {
  constructor(connection) {
    this.connection = connection
  }

  /**
   * Get students by team_id.
   */
  getByTeamId(team_id, callback) {
    team_id = parseInt(team_id)
    this.connection.query('select * from students where team_id=?', [team_id], callback)
  }
  /**
   * Add student with specified fields.
   */
  add(student, callback) {
    // build sql string and values array
    delete student.student_id // just in case
    var student_sql = sqlHelp.jsonToSQL(student)
    student_sql.sql = 'insert into students set ' + student_sql.sql
    this.connection.query(student_sql.sql, student_sql.values, callback)
  }
  /**
   * Update student with specified student_id to have values as specified in object.
   */
  update(student, callback) {
    // build sql string and values array
    var student_id = student.student_id
    delete student.student_id
    var student_sql = sqlHelp.jsonToSQL(student)
    student_sql.sql = 'update students set ' + student_sql.sql + ' where student_id=?'
    student_sql.values.push(student_id)
    this.connection.query(student_sql.sql, student_sql.values, callback)
  }
  /**
   * Delete a student with specified student_id.
   */
  delete(student, callback) {
    this.connection.query('delete from students where student_id=?',
                     [student.student_id], callback)
  }
}

module.exports = StudentsTable
