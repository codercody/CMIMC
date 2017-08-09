app.factory('auth', ['$http', '$window',
  function($http, $window){
    var auth = {};

    auth.saveToken = token => {
      $window.localStorage['jwt-token'] = token;
    };

    auth.getToken = () => $window.localStorage['jwt-token'];

    auth.removeToken = () => {
      $window.localStorage.removeItem('jwt-token');
    };

    auth.isLoggedIn = () => !!(auth.getToken());

    auth.userEmail = () => {
      if (auth.isLoggedIn()) {
        var token = auth.getToken(),
            payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.email;
      }
    };

    auth.accountId = () => {
      if (auth.isLoggedIn()) {
        var token = auth.getToken(),
            payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.account_id;
      }
    };

    return auth;
  }]);
