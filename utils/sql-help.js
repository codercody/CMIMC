'use strict'

/**
 * Returns the keys as 'key1=?, key2=?, ...' and the values in an array.
 */
function jsonToSQL(o) {
  var keys = Object.keys(o),
      keySql = keys.map(key => {
        return key + '=?'
      }).join(),
      values = keys.map(key => {
        return o[key]
      })
  return {sql: keySql, values: values}
}

module.exports = {
  jsonToSQL: jsonToSQL
}
