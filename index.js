const express = require('express'),
      app = express(),
      // parameter parsing
      bodyParser = require('body-parser'),
      // security
      crypto = require('crypto'),
      jwt = require('jsonwebtoken'),
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

app.post('/login', function(req, res) {
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
            res.json({
              success: false,
              message: 'Incorrect password.'
            })
          } else {
            // correct password
            console.log('User logged in.')
            var token = jwt.sign({
                email: user.email,
                password: user.password
              }, process.env.JWT_KEY)
              res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
              })
          }
        }
      })
})

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
        res.json({
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
            console.log('User saved successfully.')
            res.json({
              success: true,
              message: 'User saved successfully.'
            })
          })
      }
    })
})

app.listen(8000, function() {
  console.log('Listening on port 8000')
})
