app.factory('account', [
  '$http',
  '$window',
  'auth',
  function($http, $window, auth) {
    var account = {
      "account_id" : -1,
      "teams" : [] // array of teams
    };

    account.getAll = () => {
      account.account_id = auth.accountId();
      return $http.get("/account/" + account.account_id.toString(), {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(
      res => {
        account.teams = res.data;
      });
    }

    // convert from scope student to account student
    account.parseStudent = student => {
      if (!student.name || !student.email || !student.subjects || !student.age ||
          !student.tshirt || student.subjects.length !== 2) {
        return null;
      }
      var subjects = student.subjects.sort()
      return {
        student_id: student.student_id,
        team_id: student.team_id,
        name: student.name,
        email: student.email,
        subject1: subjects[0],
        subject2: subjects[1],
        age: parseInt(student.age),
        tshirt: student.tshirt
      };
    };

    account.parseTeam = team => {
      team.members = team.members.map(account.parseStudent).filter(student => {
        return !!student; // student is defined
      });
      return {
        team_id: team.team_id,
        account_id: team.account_id,
        name: team.name,
        chaperone_name: team.chaperone_name,
        chaperone_email: team.chaperone_email,
        chaperone_number: team.chaperone_number,
        paid: team.paid,
        members: team.members
      };
    };

    // convert from account student to scope student
    account.unparseStudent = student => {
      student.subjects = [student.subject1, student.subject2].sort();
      delete student.subject1;
      delete student.subject2;
      return student;
    };

    // convert from account team to scope team
    account.unparseTeam = team => {
      team.members = team.members.map(account.unparseStudent);
      return team;
    };

    // add a team to the account
    account.addTeam = team => {
      team = account.parseTeam(team);
      return $http.post('/teams/' + account.account_id.toString(), team, {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(
      res => {
        account.teams.push(team);
      });
    };

    // update a team
    account.updateTeam = team => {
      team = account.parseTeam(team);
      return $http.put('/teams/' + team.team_id, team, {
        headers: {
          'Authorization': 'JWT ' + auth.getToken(),
          'Content-Type': 'application/json'
        }
      }).then(
      res => {
        response = res.data;
        if (response.success) {
          for (var i = 0; i < account.teams.length; i++) {
            var team = account.teams[i];
            if (parseInt(team.team_id) === parseInt(response.team.team_id))
              account.teams[i] = response.team;
          }
        } else {
          alert(response.message);
        }
      });
    }

    // delete a team from the account
    account.deleteTeam = team => {
      team = account.parseTeam(team);
      return $http.delete('/teams/' + team.team_id.toString(), {
        headers: {
          Authorization: 'JWT ' + auth.getToken()
        }
      }).then(
      res => {
        response = res.data;
        if (response.success) {
          var team_id = team.team_id;
          account.teams = account.teams.filter(team => {
            return parseInt(team.team_id) !== parseInt(team_id);
          })
        } else {
          alert(response.message);
        }
      });
    }

    // initialize
    if (auth.isLoggedIn()) {
      account.account_id = auth.accountId();
      account.getAll();
    }

    return account;
}])
