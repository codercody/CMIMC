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
      })

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

function login(req, res) {
  var email = req.body.email,
      password = req.body.password
  connection.query('select * from accounts where email = ?',
      [email],
      function(err, results, fields) {
        if (err) {
          throw err
        }
        if (results.length == 0) {
          // user email not found
          console.log('Email not found.')
          res.json({
            success: false,
            message: 'Email not found.'
          })
        } else {
          // user email found
          var user = results[0],
              hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64)
                           .toString('hex')
          if (hash != user.password) {
            // incorrect password
            console.log('Incorrect password.')
            res.status(422).json({
              success: false,
              message: 'Incorrect password.'
            })
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
  var email = req.body.email,
      salt = crypto.randomBytes(16).toString('hex'),
      password = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64)
                       .toString('hex')
  // check if email is taken already
  connection.query('select * from accounts where email = ?',
    [email],
    function(err, results, fields) {
      if (err) {
        throw err
      }
      if (results.length > 0) {
        res.status(422).json({
          success: false,
          message: 'Email taken already.'
        })
      } else {
        // register user
        connection.query('insert into accounts (email, password, salt) values (?, ?, ?)',
          [email, password, salt],
          function(err, results, fields) {
            if (err) {
              throw err
            }

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
        if (err) {
          throw err
        }
        var tasks = results.map(team => {
          return function(callback) {
            connection.query('select * from students where team_id = ?',
              [team.team_id],
              function(err, results, fields) {
                if (err) {
                  callback(err, null)
                }
                team.members = results
                callback(null, team)
              })
          }
        })
        async.parallel(tasks, function(err, results) {
          if (err) {
            throw err
          }
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
    team = req.body
    connection.query('insert into teams (account_id, chaperone_name, chaperone_email, chaperone_number) values (?,?,?,?)',
      [req.user.account_id, team.chaperone_name, team.chaperone_email, team.chaperone_number],
      function(err, results, fields) {
        if (err) {
          throw err
        }
        var team_id = results.insertId,
            tasks = team.members.map(member => {
              return function(callback) {
                connection.query('insert into students (team_id, name, email, subject1, subject2, age, tshirt) values (?,?,?,?,?,?,?)',
                  [team_id, member.name, member.email, member.subject1, member.subject2, member.age, member.tshirt],
                  function(err, results, fields) {
                    if (err) {
                      callback(err, null)
                    } else {
                      callback(null, results)
                    }
                  })
              }
            })
        async.parallel(tasks, function(err, results) {
          if (err) {
            throw err
          }
          res.status(200).json(req.body)
        })
      })
  }
})

app.put('/teams/:account_id', auth.jwtAuthProtected, function(req, res) {
  if (parseInt(req.user.account_id) !== parseInt(req.params.account_id)) {
    res.status(401).json({
      success: false,
      message: 'Post to unauthorized account.'
    })
  } else {
    team = req.body
    connection.query('insert into teams (account_id, chaperone_name, chaperone_email, chaperone_number) values (?,?,?,?)',
      [req.user.account_id, team.chaperone_name, team.chaperone_email, team.chaperone_number],
      function(err, results, fields) {
        if (err) {
          throw err
        }
        var team_id = results.insertId,
            tasks = team.members.map(member => {
              return function(callback) {
                connection.query('insert into students (team_id, name, email, subject1, subject2, age, tshirt) values (?,?,?,?,?,?,?)',
                  [team_id, member.name, member.email, member.subject1, member.subject2, member.age, member.tshirt],
                  function(err, results, fields) {
                    if (err) {
                      callback(err, null)
                    } else {
                      callback(null, results)
                    }
                  })
              }
            })
        async.parallel(tasks, function(err, results) {
          if (err) {
            throw err
          }
          res.status(200).json(req.body)
        })
      })
  }
})

app.listen(8000, function() {
  console.log('Listening on port 8000')
})
