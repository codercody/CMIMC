app.controller('MainCtrl', [
  '$scope',
  '$state',
  '$http',
  'auth',
  'account',
  function($scope, $state, $http, auth, account) {
    $scope.year = "N/A";
    $scope.registration_open = "N/A";
    $scope.registration_close = "N/A";
    $scope.payment_deadline = "N/A";
    $scope.contest_date = "N/A";

    $http.get('/assets/js/json/info.json').then(res => {
      $scope.year = res.data.year;
      $scope.registration_open = res.data.registration_open;
      $scope.registration_close = res.data.registration_close;
      $scope.payment_deadline = res.data.payment_deadline;
      $scope.contest_date = res.data.contest_date;
      $scope.registration_price = res.data.registration_price;
      $scope.subjects = res.data.subjects;
      $scope.tshirts = res.data.tshirts;
    });

    $scope.isLoggedIn = auth.isLoggedIn;

    $scope.login_info = {};
    $scope.signup_info = {};

    $scope.login = function() {
      if (!$scope.login_info.email) {
        $scope.login_info.fail = true;
        $scope.login_info.message = 'Email cannot be empty.';
        return;
      }
      if (!$scope.login_info.password) {
        $scope.login_info.fail = true;
        $scope.login_info.message = 'Password cannot be empty.';
        return;
      }
      $scope.login_info.fail = false;
      $http.post("/login", {
        email: $scope.login_info.email,
        password: $scope.login_info.password
      }, {
        "headers": "Content-Type: 'appliation/json'"
      }).then(
      res => {
        var response = res.data;
        if (!response.success) {
          $scope.login_info.fail = true;
          $scope.login_info.message = response.message;
          return;
        }
        $scope.login_info = {
          fail: false
        };
        $('#login').modal('close');
        auth.saveToken(response.token);
        $state.go('account');
      },
     err => {
        var response = err.data;
        $scope.login_info.fail = true;
        $scope.login_info.message = response.message;
      });
    };

    $scope.signup = function() {
      if (!$scope.signup_info.email) {
        $scope.signup_info.fail = true;
        $scope.signup_info.message = 'Email cannot be empty.';
        return;
      }
      if (!$scope.signup_info.password) {
        $scope.signup_info.fail = true;
        $scope.signup_info.message = 'Password cannot be empty.';
        return;
      }
      if ($scope.signup_info.password !== $scope.signup_info.password_confirm) {
        $scope.signup_info.fail = true;
        $scope.signup_info.message = 'Passwords must match.';
        return;
      }
      $scope.signup_info.fail = false;
      $http.post('/register', {
        email: $scope.signup_info.email,
        password: $scope.signup_info.password
      }, {
        'headers': 'Content-type: "text/json"'
      }).then(
      res => {
        var response = res.data;
        if (!response.success) {
          $scope.signup_info.fail = true;
          $scope.signup_info.message = response.message;
          return;
        }
        $scope.signup_info = {
          fail: false
        };
        auth.saveToken(response.token);
        $state.go('account');
      },
     err => {
        var response = err.data;
        $scope.signup_info.fail = true;
        $scope.signup_info.message = response.message;
      });
    };

    $scope.logout = function() {
      auth.removeToken();
      $state.go('main');
    };

    $( document ).ready(function() {
      $('.modal').modal();
    });
}])
