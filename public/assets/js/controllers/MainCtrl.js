app.controller('MainCtrl', [
  '$scope',
  '$state',
  '$http',
  'auth',
  '$rootScope',
  function($scope, $state, $http, auth) {
    $scope.year = "N/A"
    $scope.registration_open = "N/A"
    $scope.registration_close = "N/A"
    $scope.payment_deadline = "N/A"
    $scope.contest_date = "N/A"

    $http.get('/assets/js/json/info.json').then(function(res){
      $scope.year = res.data.year
      $scope.registration_open = res.data.registration_open
      $scope.registration_close = res.data.registration_close
      $scope.payment_deadline = res.data.payment_deadline
      $scope.contest_date = res.data.contest_date
      $scope.registration_price = res.data.registration_price
      $scope.subjects = []
      for(i = 0; i < res.data.subjects.length - 1; i++)
        for(j = i+1; j < res.data.subjects.length; j++)
          $scope.subjects.push(res.data.subjects[i] + ", " + res.data.subjects[j])
      $scope.tshirts = res.data.tshirts
    })

    $scope.isLoggedIn = auth.isLoggedIn

    $scope.login = function() {
      if (!$scope.login.email) {
        $scope.login.fail = true
        $scope.login.message = 'Email cannot be empty.'
        return
      }
      if (!$scope.login.password) {
        $scope.login.fail = true
        $scope.login.message = 'Password cannot be empty.'
        return
      }
      $scope.login.fail = false
      $http.post("/login", {
        email: $scope.login.email,
        password: $scope.login.password
      }, {
        "headers": "Content-Type: 'text/json'"
      }).then(function(result) {
        var response = result.data
        if (!response.success) {
          $scope.login.fail = true
          $scope.login.message = response.message
          return
        }
        $scope.signup = {
          fail: false
        }
        $('#login').modal('close')
        auth.saveToken(response.token)
        $state.go('account')
      })
    }

    $scope.signup = function() {
      if (!$scope.signup.email) {
        $scope.signup.fail = true
        $scope.signup.message = 'Email cannot be empty, dumbass.'
        return
      }
      if (!$scope.signup.password) {
        $scope.signup.fail = true
        $scope.signup.message = 'Password cannot be empty.'
        return
      }
      if ($scope.signup.password !== $scope.signup.password_confirm) {
        $scope.signup.fail = true
        $scope.signup.message = 'Passwords must match.'
        return
      }
      $scope.signup.fail = false
      $http.post('/register', {
        email: $scope.signup.email,
        password: $scope.signup.password
      }, {
        'headers': 'Content-type: "text/json"'
      }).then(function(result) {
        var response = result.data
        if (!response.success) {
          $scope.signup.fail = true
          $scope.signup.message = response.message
          return
        }
        $scope.signup = {
          fail: false
        }
        auth.saveToken(response.token)
        $state.go('account')
      })
    }

    $scope.logout = function() {
      auth.removeToken()
      $state.go('main')
    }

    $scope.fuckMyself = function() {
      $http.get("/account/" + auth.accountId(), {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      })
    }

    $( document ).ready(function() {
      $('.modal').modal()
    })
}])
