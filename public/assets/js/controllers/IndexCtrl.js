app.controller('IndexCtrl', [
  '$scope',
  '$state',
  '$http',
  function($scope, $state, $http) {
    $http.get('/assets/js/json/news.json').then(res => {
      $scope.news = res.data.news;
    });

    $(document).ready(function() {
      $('.parallax').parallax();
    });
}])
