app.controller('MainCtrl', [
  '$scope',
  '$state',
  '$http',
  function($scope, $state, $http) {
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
    })

    $scope.worry = function() {
      $http.get("/assets/js/json/cody.json").then(function(res) {
        alert(JSON.stringify(res))
        $state.go('information')
      })
    }

    $scope.login = function() {
      $http.post("/login", {
        "email": $scope.user.email,
        "password": $scope.user.password
      }, {
        "headers": "Content-Type: 'text/json'"
      }).then(function(result) {
        alert(JSON.stringify(result))
      })
    }

    $scope.register = function() {
      $http.post('/register', {
        'email': 'ailee@ailee.com',
        'password': 'ailee-password'
      }, {
        'headers': 'Content-type: "text/json"'
      }).then(function(result) {
        alert(JSON.stringify(result))
      })
    }
}])
