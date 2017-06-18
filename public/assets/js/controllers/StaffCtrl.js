app.controller('StaffCtrl', [
  '$scope',
  '$state',
  '$http',
  function($scope, $state, $http) {
    $http.get('/assets/js/json/staff.json').then(function(res){
      $scope.staff_list = res.data.staff
    })
}])
