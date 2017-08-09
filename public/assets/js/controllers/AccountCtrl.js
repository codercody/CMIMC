app.controller('AccountCtrl', [
  '$scope',
  '$state',
  '$http',
  'auth',
  'account',
  function($scope, $state, $http, auth, account) {
    account.getAll().catch(err => {
      $scope.error = true;
      $scope.message = 'Failed to retrieve teams, please refresh and try again.';
    });

    $scope.team_empty = {
      "members" : [
        {
          "subjects" : [],
          "tshirt" : "M"
        }
      ]
    };
    $scope.team_modify = $scope.team_empty;
    $scope.team_modal_mode = "";
    $scope.teams = account.teams.map(account.unparseTeam);

    $scope.showAdd = () => {
      $scope.team_modal_mode = "add";
      $scope.team_modify = $scope.team_empty;
    }

    $scope.showEdit = team => {
      $scope.team_modal_mode = "edit";
      $scope.team_modify = JSON.parse(JSON.stringify(team));
    }

    $scope.addMember = i => {
      if (i == -1)
        $scope.team_modify.members.push({
          "subjects" : {},
          "tshirt" : "M"
        });
      else
        $scope.teams[i].members.push({
          "subjects" : {},
          "tshirt" : "M"
        });
    };

    $scope.removeMember = (i, j) => {
      if (i == -1) {
        $scope.team_modify.members.splice(j, 1);
        if ($scope.team_modify.members.length == 0)
          $scope.addMember(-1);
      } else {
        $scope.teams[i].members.splice(j, 1);
        if ($scope.teams[i].members.length == 0)
          $scope.addMember(i);
      }
    };

    $scope.teamModalSubmit = mode => {
      if (mode === "add") {
        account.addTeam($scope.team_modify).then(() => {
          $scope.error = false;
          $('#team-modal').modal('close');
          $scope.teams = account.teams.map(account.unparseTeam);
          $scope.team_modify = $scope.team_empty;
        }).catch(err => {
          $scope.error = true;
          $scope.message = 'Failed to add teams, please refresh and try again.';
        });
      } else if (mode === "edit") {
        account.updateTeam($scope.team_modify).then(() => {
          $scope.error = false;
          $('#team-modal').modal('close');
          $scope.teams = account.teams.map(account.unparseTeam);
          $scope.team_modify = $scope.team_empty;
        }).catch(err => {
          $scope.error = true;
          $scope.message = 'Failed to add teams, please refresh and try again.';
        });
      }
    };

    $scope.deleteTeam = i => {
      $scope.error = false;
      account.deleteTeam($scope.teams[i]).then(() => {
        $scope.teams = account.teams.map(account.unparseTeam);
      }).catch(err => {
        $scope.error = true;
        $scope.message = 'Failed to delete team, please refresh and try again.';
      });
    };

    $scope.$on('refreshMaterialize', () => {
      $('select').material_select();
      Materialize.updateTextFields();
      $('.modal').modal();
    });
}])
