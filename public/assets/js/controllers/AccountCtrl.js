app.controller('AccountCtrl', [
  '$scope',
  '$state',
  '$http',
  'auth',
  'account',
  function($scope, $state, $http, auth, account) {
    $scope.team_empty = {
      "members" : [
        {
          "subjects" : [],
          "tshirt" : "M"
        }
      ]
    }
    $scope.team_modify = $scope.team_empty
    $scope.team_modal_mode = ""
    $scope.teams = account.teams.map(account.unparseTeam)

    $scope.showAdd = function() {
      $scope.team_modal_mode = "add"
      $scope.team_modify = $scope.team_empty
    }

    $scope.showEdit = function(team) {
      $scope.team_modal_mode = "edit"
      $scope.team_modify = JSON.parse(JSON.stringify(team))
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

    $scope.teamModalSubmit = function(mode) {
      if (mode === "add") {
        account.addTeam($scope.team_modify).then(function() {
          $('#team-modal').modal('close')
          $scope.teams = account.teams.map(account.unparseTeam)
          $scope.team_modify = $scope.team_empty
        })
      } else if (mode === "edit") {
        account.updateTeam($scope.team_modify).then(function() {
          $('#team-modal').modal('close')
          $scope.teams = account.teams.map(account.unparseTeam)
          $scope.team_modify = $scope.team_empty
        })
      }
    }

    $scope.deleteTeam = function(i) {
      account.deleteTeam($scope.teams[i]).then(function() {
        $scope.teams = account.teams.map(account.unparseTeam)
      })
    }

    $scope.$on('refreshMaterialize', function() {
      $('select').material_select()
      Materialize.updateTextFields()
      $('.modal').modal()
    })
}])
