app.controller('AccountCtrl', [
  '$scope',
  '$state',
  '$http',
  '$timeout',
  function($scope, $state, $http) {
    $scope.new_team = {"members" : [{
      "subjects" : $scope.subjects[0],
      "tshirt" : "M"
    }]}
    $scope.teams_original = [
      {
        "id" : 1,
        "name" : "The Sexy Primes",
        "chaperone_name" : "Cody Johnson",
        "chaperone_email" : "ctj@math.cmu.edu",
        "chaperone_number" : "(561) 676-5696",
        "paid" : "Paid",
        "members" : [
          {
            "name" : "Elizabeth Cao",
            "age" : 17,
            "subjects" : "Combinatorics, Computer Science",
            "tshirt" : "M",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Rithvik Pasumarty",
            "age" : 17,
            "subjects" : "Computer Science, Geometry",
            "tshirt" : "XXL",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Weihua Zhu (Aiden)",
            "age" : 17,
            "subjects" : "Algebra, Geometry",
            "tshirt" : "S",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Xuyang Li (Irio)",
            "age" : 17,
            "subjects" : "Algebra, Number Theory",
            "tshirt" : "S",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Zihao Li (Chris)",
            "age" : 18,
            "subjects" : "Computer Science, Number Theory",
            "tshirt" : "L",
            "email" : "idk@idk.com"
          }
        ]
      },
      {
        "id" : 2,
        "name" : "The Ugly Primes",
        "chaperone_name" : "Cody Johnson",
        "chaperone_email" : "ctj@math.cmu.edu",
        "chaperone_number" : "(561) 676-5696",
        "paid" : "Paid",
        "members" : [
          {
            "name" : "Elizabeth Cao",
            "age" : 17,
            "subjects" : "Combinatorics, Computer Science",
            "tshirt" : "M",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Rithvik Pasumarty",
            "age" : 17,
            "subjects" : "Computer Science, Geometry",
            "tshirt" : "XXL",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Weihua Zhu (Aiden)",
            "age" : 17,
            "subjects" : "Algebra, Geometry",
            "tshirt" : "S",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Xuyang Li (Irio)",
            "age" : 17,
            "subjects" : "Algebra, Number Theory",
            "tshirt" : "S",
            "email" : "idk@idk.com"
          },
          {
            "name" : "Zihao Li (Chris)",
            "age" : 18,
            "subjects" : "Computer Science, Number Theory",
            "tshirt" : "L",
            "email" : "idk@idk.com"
          }
        ]
      }
    ]
    $scope.teams = JSON.parse(JSON.stringify($scope.teams_original))
    $scope.addMember = function(i) {
      if (i == -1)
        $scope.new_team.members.push({
          "subjects" : $scope.subjects[0],
          "tshirt" : "M"
        })
      else
        $scope.teams[i].members.push({
          "subjects" : $scope.subjects[0],
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
