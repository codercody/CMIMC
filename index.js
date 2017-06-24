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
      console.log('Email not found.')
      res.json({ success: false, message: 'Email not found.' })
    } else {
      // user email found
      var user = results[0],
          hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64)
                       .toString('hex')
      if (hash !== user.password) {
        // incorrect password
        console.log('Incorrect password.')
        res.status(422).json({ success: false, message: 'Incorrect password.' })
      } else {
        // correct password
        console.log('User logged in.')
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
    connection.query('select * from teams where account_id = ?',
      [req.user.account_id],
      function(err, results, fields) {
        if (err) throw err
        var tasks = results.map(team => {
          return function(callback) {
            connection.query('select * from students where team_id = ?',
              [team.team_id],
              function(err, results, fields) {
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
    var team = req.body
    connection.query('insert into teams (account_id, name, chaperone_name, chaperone_email, chaperone_number) values (?,?,?,?,?)',
      [req.user.account_id, team.name, team.chaperone_name, team.chaperone_email, team.chaperone_number],
      function(err, results, fields) {
        if (err) throw err
        var team_id = results.insertId,
            tasks = team.members.map(student => {
              return function(callback) {
                studentsTable.add(student, function(err, results, fields) {
                  if (err) callback(err, null)
                  else callback(null, results)
                })
              }
            })
        async.parallel(tasks, function(err, results) {
          if (err) throw err
          res.status(200).json(req.body)
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
        teamsTable.delete(team, function(err, results, fields) {
          if (err) throw err
          res.status(200).json({ success: true, message: 'Team deleted.' })
        })
      }
    }
  })
})

app.listen(8000, function() {
  console.log('Listening on port 8000')
})
