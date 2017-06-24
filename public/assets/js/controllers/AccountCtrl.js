app.controller('AccountCtrl', [
  '$scope',
  '$state',
  '$http',
  'auth',
  'account',
  function($scope, $state, $http, auth, account) {
    $scope.empty_team = {"members" : [{
      "subjects" : {},
      "tshirt" : "M"
    }]}
    $scope.team_modify = $scope.empty_team
    $scope.adding = true
    $scope.teams = account.teams

    $scope.showAdd = function() {
      $scope.adding = true
      $scope.team_modify = $scope.empty_team
    }

    $scope.showEdit = function(team) {
      $scope.adding = false
      $scope.team_modify = team
    }

    $scope.addMember = function(i) {
      if (i == -1)
        $scope.team_modify.members.push({
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
        $scope.team_modify.members.splice(j, 1)
        if ($scope.team_modify.members.length == 0)
          $scope.addMember(-1)
      } else {
        $scope.teams[i].members.splice(j, 1)
        if ($scope.teams[i].members.length == 0)
          $scope.addMember(i)
      }
    }

    $scope.addTeam = function() {
      account.addTeam($scope.team_modify).then(function() {
        $scope.teams = account.teams
        $scope.team_modify = $scope.empty_team
      })
    }

    $scope.updateTeam = function() {
      account.updateTeam($scope.team_modify).then(function() {
        $scope.teams = account.teams
        $scope.team_modify = $scope.empty_team
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
