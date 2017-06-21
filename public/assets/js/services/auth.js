app.factory('auth', ['$http', '$window',
  function($http, $window){
    var auth = {}

    auth.saveToken = function (token) {
      $window.localStorage['jwt-token'] = token
    }

    auth.getToken = function () {
      return $window.localStorage['jwt-token']
    }

    auth.removeToken = function() {
      $window.localStorage.removeItem('jwt-token')
    }

    auth.isLoggedIn = function () {
      var token = auth.getToken()

      if (token) {
        return true
      } else {
        return false
      }
    }

    auth.userEmail = function () {
      if (auth.isLoggedIn()) {
        var token = auth.getToken()
        var payload = JSON.parse($window.atob(token.split('.')[1]))

        return payload.email
      }
    }

    auth.accountId = function () {
      if (auth.isLoggedIn()) {
        var token = auth.getToken()
        var payload = JSON.parse($window.atob(token.split('.')[1]))

        return payload.id
      }
    }

    return auth
  }])
