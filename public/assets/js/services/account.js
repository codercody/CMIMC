app.factory('account', ['$http', '$window',
  function($http, $window){
    var account = {
      "account_id" : -1,
      "teams" : [] // array of teams
    }

    return account
  }])
