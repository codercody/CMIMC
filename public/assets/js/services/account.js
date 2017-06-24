app.factory('account', [
  '$http',
  '$window',
  'auth',
  function($http, $window, auth) {
    var account = {
      "account_id" : -1,
      "teams" : [] // array of teams
    }

    account.getAll = function() {
      account.account_id = auth.accountId()
      $http.get("/account/" + account.account_id, {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(function(result) {
        account.teams = result.data
      })
    }

    account.parseStudent = function(student) {
      var subjects = student.subjects.sort()
      return {
        team_id: student.team_id,
        name: student.name,
        email: student.email,
        subject1: subjects[0],
        subject2: subjects[1],
        age: parseInt(student.age),
        tshirt: student.tshirt
      }
    }

    // add a whole team to the account
    account.addTeam = function(team) {
      // change subjects array into two separate fields
      var teamCopy = JSON.parse(JSON.stringify(team))
      teamCopy.members = teamCopy.members.map(account.parseStudent)
      return $http.post('/teams/' + account.account_id, teamCopy, {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(function(result) {
        account.teams.push(team)
      }, function(result) {
        alert('error!')
      })
    }

    // delete a whole team from the account
    account.deleteTeam = function(team) {
      return $http.delete('/teams/' + team.team_id, {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(function(result) {
        response = result.data
        if (response.success) {
          var team_id = team.team_id
          account.teams = account.teams.filter(team => {
            return parseInt(team.team_id) !== parseInt(team_id)
          })
        } else {
          alert(response.message)
        }
      }, function(result) {
        alert('error!')
      })
    }

    // initialize
    account.account_id = auth.accountId()
    account.getAll()

    return account
}])
