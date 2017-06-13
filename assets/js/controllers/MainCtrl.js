app.controller('MainCtrl', [
  '$scope',
  '$state',
  '$http',
  function($scope, $state, $http) {
    $scope.cody = 'retard'

    $scope.gaelics = ['o cuidighthigh', 'hrodebert', 'Splidd']

    $scope.worry = function() {
      $http.get("/assets/js/json/cody.json").then(function(res) {
        alert(JSON.stringify(res))
        $state.go('information')
      })
    }
}])
