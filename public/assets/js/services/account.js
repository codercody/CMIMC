app.factory('account', [
  '$http',
  '$window',
  'auth',
  function($http, $window, auth) {
    var account = {
      "account_id" : -1,
      "teams" : [] // array of teams
    }

    account.addTeam = function(team) {
      $http.post('/teams/' + auth.accountId(), team, {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(function(result) {
        alert(JSON.stringify(result))
      }, function(result) {
        alert(JSON.stringify(result))
      })
    }

    return account
}])
