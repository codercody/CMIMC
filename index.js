'use strict'

const express = require('express'),
      app = express(),
      async = require('async'),
      // parameter parsing
      bodyParser = require('body-parser'),
      // security
      crypto = require('crypto'),
      jwt = require('jsonwebtoken'),
      auth = require('express-jwt-token'),
      // mysql database
      mysql = require('mysql'),
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.MYSQL_PASSWORD,
        database: 'cmimc'
      }),
      sqlHelp = require('./utils/sql-help.js'),
      StudentsTable = require('./utils/students-table'),
      AccountsTable = require('./utils/accounts-table'),
      TeamsTable = require('./utils/teams-table')

var studentsTable = new StudentsTable(connection),
    accountsTable = new AccountsTable(connection),
    teamsTable = new TeamsTable(connection)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

function login(req, res) {
  var email = req.body.email,
      password = req.body.password
  accountsTable.getByEmail(email, function(err, results, fields) {
    if (err) throw err
    if (results.length === 0) {
      // user email not found
      res.json({ success: false, message: 'Email not found.' })
    } else {
      // user email found
      var user = results[0],
          hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64)
                       .toString('hex')
      if (hash !== user.password) {
        // incorrect password
        res.status(422).json({ success: false, message: 'Incorrect password.' })
      } else {
        // correct password
        var token = jwt.sign({
            email: user.email,
            account_id: user.account_id
          }, process.env.JWT_SECRET_KEY)
          res.status(200).json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          })
      }
    }
  })
}

app.post('/login', login)

app.post('/register', function(req, res) {
  var email = req.body.email
  // check if email is taken already
  accountsTable.getByEmail(email, function(err, results, fields) {
    if (err) throw err
    if (results.length > 0) {
      res.status(422).json({
        success: false,
        message: 'Email taken already.'
      })
    } else {
      // register account
      var salt = crypto.randomBytes(16).toString('hex'),
          account = {
            email: email,
            password: crypto.pbkdf2Sync(req.body.password, salt, 1000, 64)
                             .toString('hex'),
            salt: salt
          }
      accountsTable.add(account, function(err, results, fields) {
        if (err) throw err
        login(req, res)
      })
    }
  })
})

app.get('/account/:account_id', auth.jwtAuthProtected, function(req, res) {
  if (parseInt(req.user.account_id) !== parseInt(req.params.account_id)) {
    res.status(401)
  } else {
    teamsTable.getByAccountId(req.user.account_id, function(err, results, fields) {
      if (err) throw err
      var tasks = results.map(team => {
        return function(callback) {
          studentsTable.getByTeamId(team.team_id, function(err, results, fields) {
            if (err) callback(err, null)
            team.members = results
            callback(null, team)
          })
        }
      })
      async.parallel(tasks, function(err, results) {
        if (err) throw err
        res.status(200).json(results)
      })
    })
  }
})

app.post('/teams/:account_id', auth.jwtAuthProtected, function(req, res) {
  if (parseInt(req.user.account_id) !== parseInt(req.params.account_id)) {
    res.status(401).json({
      success: false,
      message: 'Post to unauthorized account.'
    })
  } else {
    var team = req.body,
        members = team.members
    delete team.members
    team.account_id = parseInt(req.user.account_id)
    teamsTable.add(team, function(err, results, fields) {
      if (err) throw err
      var team_id = results.insertId,
          tasks = members.map(student => {
            return function(callback) {
              student.team_id = team_id
              studentsTable.add(student, function(err, results, fields) {
                if (err) callback(err, null)
                else callback(null, results)
              })
            }
          })
      async.parallel(tasks, function(err, results) {
        if (err) throw err
        res.status(200).json({
          success: true,
          message: 'Team added successfully.'
        })
      })
    })
  }
})

app.put('/teams/:team_id', auth.jwtAuthProtected, function(req, res) {
  if (parseInt(req.user.account_id) !== parseInt(req.body.account_id)) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized team update.'
    })
  } else {
    var team = JSON.parse(JSON.stringify(req.body)),
        members = team.members
    delete team.members
    team.account_id = parseInt(req.user.account_id)
    teamsTable.update(team, function(err, results, fields) {
      if (err) throw err
      var tasks = members.map(student => {
            return function(callback) {
              if (student.student_id) {
                studentsTable.update(student, function(err, results, fields) {
                  if (err) callback(err, null)
                  else callback(null, results)
                })
              } else {
                student.team_id = req.body.team_id
                studentsTable.add(student, function(err, results, fields) {
                  if (err) callback(err, null)
                  else callback(null, results)
                })
              }
            }
          })
      async.parallel(tasks, function(err, results) {
        if (err) throw err
        res.status(200).json({
          success: true,
          message: 'Team updated successfully.',
          team: req.body
        })
      })
    })
  }
})

app.delete('/teams/:team_id', auth.jwtAuthProtected, function(req, res) {
  teamsTable.getById(req.params.team_id, function(err, results, fields) {
    if (err) throw err
    if (results.length === 0) {
      // team not found
      res.status(200).json({ success: false, message: 'Team not found.' })
    } else {
      // team found
      var team = results[0]
      if (parseInt(team.account_id) !== parseInt(req.user.account_id)) {
        // unauthorized delete
        res.status(401).json({ success: false, message: 'Unauthorized team delete.' })
      } else {
        studentsTable.deleteByTeamId(team.team_id, function(err, results, fields) {
          if (err) throw err
          teamsTable.delete(team, function(err, results, fields) {
            if (err) throw err
            res.status(200).json({ success: true, message: 'Team deleted.' })
          })
        })
      }
    }
  })
})

app.listen(8000, function() {
  console.log('Listening on port 8000')
})
