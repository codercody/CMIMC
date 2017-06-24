app.controller('AccountCtrl', [
  '$scope',
  '$state',
  '$http',
  'auth',
  'account',
  function($scope, $state, $http, auth, account) {
    $scope.new_team = {"members" : [{
      "subjects" : {},
      "tshirt" : "M"
    }]}
    $scope.teams = account.teams
    $scope.addMember = function(i) {
      if (i == -1)
        $scope.new_team.members.push({
          "subjects" : {},
          "tshirt" : "M"
        })
      else
        $scope.teams[i].members.push({
          "subjects" : {},
          "tshirt" : "M"
        })
    }
    $scope.removeMember = function(i, j) {
      if (i == -1) {
        $scope.new_team.members.splice(j, 1)
        if ($scope.new_team.members.length == 0)
          $scope.addMember(-1)
      } else {
        $scope.teams[i].members.splice(j, 1)
        if ($scope.teams[i].members.length == 0)
          $scope.addMember(i)
      }
    }

    $scope.addTeam = function() {
      account.addTeam($scope.new_team).then(function() {
        $scope.teams = account.teams
      })
    }

    $scope.deleteTeam = function(i) {
      account.deleteTeam($scope.teams[i]).then(function() {
        $scope.teams = account.teams
      })
    }

    $scope.$on('refreshMaterialize', function() {
      $('select').material_select()
      Materialize.updateTextFields()
      $('.modal').modal({
          complete: function() {
            $state.reload()
          }
        }
      )
    })
}])
