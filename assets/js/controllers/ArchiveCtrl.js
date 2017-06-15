app.controller('ArchiveCtrl', [
  '$scope',
  '$state',
  '$http',
  function($scope, $state, $http) {
    $http.get('/assets/js/json/archive.json').then(function(res){
      $scope.contest_problems = res.data.problems
      $scope.contest_results = res.data.results
      $scope.contest_photos = res.data.photos
      $scope.do_something = function (x) {
        s = x[0]
        for (i = 1; i < x.length; i++)
          s += ", " + x[i];
        return s
      }
    })
}])
