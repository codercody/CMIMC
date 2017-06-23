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

    account.addTeam = function(team) {
      return $http.post('/teams/' + account.account_id, team, {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(function(result) {
        account.teams.push(result.data)
      }, function(result) {
        alert('error!')
      })
    }

    // initialize
    account.account_id = auth.accountId()
    account.getAll()

    return account
}])
