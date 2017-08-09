'use strict';

const express = require('express'),
      app = express(),
      async = require('async'),
      // parameter parsing
      bodyParser = require('body-parser'),
      // security
      crypto = require('crypto'),
      jwt = require('jsonwebtoken'),
      // mysql database
      mysql = require('mysql'),
      connection = mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || process.env.MYSQL_PASSWORD,
        database: process.env.DATABASE_NAME || 'cmimc'
      }),
      sqlHelp = require('./utils/sql-help.js'),
      StudentsTable = require('./utils/students-table'),
      AccountsTable = require('./utils/accounts-table'),
      TeamsTable = require('./utils/teams-table');

const SECRET = process.env.JWT_SECRET_KEY;

/* middleware for authorizing user */
const authorizeJWT = (req, res, next) => {
  var token = req.headers.authorization.substr('JWT '.length);
  token = token || req.body.token || req.query.token;
  if (token) {
    jwt.verify(token, SECRET, function(err, decoded) {
      if (err) {
        res.status(503).json({
          message: 'Failed to authenticate token.'
        });
      } else {
        req.payload = decoded;
        next();
      }
    });
  } else 
    res.status(403).json({message: 'No token provided.'});
}

var studentsTable = new StudentsTable(connection),
    accountsTable = new AccountsTable(connection),
    teamsTable = new TeamsTable(connection);

app.set('port', (process.env.PORT || 8000));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/archive', express.static('public/assets/docs/past-tests'));

function login(req, res) {
  var email = req.body.email,
      password = req.body.password;
  accountsTable.getByEmail(email, function(err, results, fields) {
    if (err) throw err;
    if (results.length === 0) {
      // user email not found
      res.json({ success: false, message: 'Email not found.' });
    } else {
      // user email found
      var user = results[0],
          hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64)
                       .toString('hex');
      if (hash !== user.password) {
        // incorrect password
        res.status(422).json({ 
          success: false, 
          message: 'Incorrect password.' 
        });
      } else {
        // correct password
        var token = jwt.sign({
            email: user.email,
            account_id: user.account_id
          }, SECRET);
        res.status(200).json({
          success: true,
          message: 'Enjoy your token!', token: token
        });
      }
    }
  })
};

app.post('/login', login);

app.post('/register', function(req, res) {
  var email = req.body.email;
  // check if email is taken already
  accountsTable.getByEmail(email, function(err, results, fields) {
    if (err) throw err;
    if (results.length > 0) {
      res.status(422).json({
        success: false,
        message: 'Email taken already.'
      });
    } else {
      // register account
      var salt = crypto.randomBytes(16).toString('hex'),
          account = {
            email: email,
            password: crypto.pbkdf2Sync(req.body.password, salt, 1000, 64)
                             .toString('hex'),
            salt: salt
          };
      accountsTable.add(account, function(err, results, fields) {
        if (err) throw err;
        login(req, res);
      });
    }
  });
});

app.get('/account/:account_id', authorizeJWT, function(req, res) {
  if (parseInt(req.payload.account_id) !== parseInt(req.params.account_id)) {
    res.status(401);
  } else {
    teamsTable.getByAccountId(req.payload.account_id, function(err, results, fields) {
      if (err) throw err;
      var tasks = results.map(team => {
        return function(callback) {
          studentsTable.getByTeamId(team.team_id, function(err, results, fields) {
            if (err) callback(err, null);
            team.members = results;
            callback(null, team);
          });
        }
      });
      async.parallel(tasks, function(err, results) {
        if (err) throw err;
        res.status(200).json(results);
      });
    })
  }
})

app.post('/teams/:account_id', authorizeJWT, function(req, res) {
  if (parseInt(req.payload.account_id) !== parseInt(req.params.account_id)) {
    res.status(401).json({
      success: false,
      message: 'Post to unauthorized account.'
    });
  } else {
    var team = req.body,
        members = team.members;
    delete team.members;
    team.account_id = parseInt(req.payload.account_id);
    team.active_year = (new Date()).getFullYear();
    teamsTable.add(team, function(err, results, fields) {
      if (err) throw err;
      var team_id = results.insertId,
          tasks = members.map(student => {
            return function(callback) {
              student.team_id = team_id;
              studentsTable.add(student, function(err, results, fields) {
                if (err) callback(err, null)
                else callback(null, results)
              });
            };
          });
      async.parallel(tasks, function(err, results) {
        if (err) throw err;
        res.status(200).json({
          success: true,
          message: 'Team added successfully.'
        });
      });
    });
  }
});

app.put('/teams/:team_id', authorizeJWT, function(req, res) {
  if (parseInt(req.payload.account_id) !== parseInt(req.body.account_id)) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized team update.'
    });
  } else {
    var team = JSON.parse(JSON.stringify(req.body)),
        members = team.members;
    delete team.members;
    team.account_id = parseInt(req.payload.account_id);
    // update team info
    teamsTable.update(team, function(err, results, fields) {
      if (err) throw err;
      // delete students not in the new team
      var new_team_students = req.body.members.map(student => {
        return parseInt(student.student_id);
      }).filter(student_id => {
        return !!student_id;
      });
      studentsTable.getByTeamId(req.body.team_id, function(err, results, fields) {
        if (err) throw err;
        var tasks = results.map(student => {
          return function(callback) {
            var student_id = parseInt(student.student_id);
            if (new_team_students.indexOf(student_id) < 0) {
              studentsTable.delete(student, function(err, results, fields) {
                if (err) callback(err, null);
                else callback(err, results);
              });
            } else {
              callback(null, null);
            }
          }
        });
        async.parallel(tasks, function(err, results) {
          if (err) throw err;
          // update registered students and add new students
          var tasks = members.map(student => {
            return function(callback) {
              if (student.student_id) {
                // student is already registered
                studentsTable.update(student, function(err, results, fields) {
                  if (err) callback(err, null);
                  else callback(null, results);
                });
              } else {
                // add student
                student.team_id = req.body.team_id;
                studentsTable.add(student, function(err, results, fields) {
                  if (err) callback(err, null);
                  else callback(null, results);
                });
              }
            };
          });
          async.parallel(tasks, function(err, results) {
            if (err) throw err;
            else {
              res.status(200).json({
                success: true,
                message: 'Team updated successfully.',
                team: req.body
              });
            }
          });
        });
      });
    });
  }
});

app.delete('/teams/:team_id', authorizeJWT, function(req, res) {
  teamsTable.getById(req.params.team_id, function(err, results, fields) {
    if (err) throw err;
    if (results.length === 0) {
      // team not found
      res.status(200).json({ success: false, message: 'Team not found.' });
    } else {
      // team found
      var team = results[0];
      if (parseInt(team.account_id) !== parseInt(req.payload.account_id)) {
        // unauthorized delete
        res.status(401).json({ success: false, message: 'Unauthorized team delete.' });
      } else {
        studentsTable.deleteByTeamId(team.team_id, function(err, results, fields) {
          if (err) throw err;
          teamsTable.delete(team, function(err, results, fields) {
            if (err) throw err;
            res.status(200).json({ success: true, message: 'Team deleted.' });
          });
        });
      }
    }
  });
});

app.get('/*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(app.get('port'), function() {
  console.log('CMIMC registration server running.');
})
