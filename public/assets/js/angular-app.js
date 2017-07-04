var app = angular.module('mainApp', ['ui.router'])

app.config([
  '$locationProvider',
  '$urlMatcherFactoryProvider',
  function($locationProvider, $urlMatcherFactoryProvider) {
  $locationProvider.hashPrefix('')
  $locationProvider.html5Mode(true)
  $urlMatcherFactoryProvider.strictMode(false)
}])

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: '/views/index.html',
        controller: 'IndexCtrl'
      })
      .state('information', {
        url: '/information',
        templateUrl: '/views/information.html'
      })
      .state('archive', {
        url: '/archive',
        templateUrl: '/views/archive.html',
        controller: 'ArchiveCtrl'
      })
      .state('staff', {
        url: '/staff',
        templateUrl: '/views/staff.html',
        controller: 'StaffCtrl'
      })
      .state('account', {
        url: '/account',
        templateUrl: '/views/account.html',
        controller: 'AccountCtrl',
        resolve: {
          teamsPromise: ['account', function(account){
            return account.getAll()
          }]
        },
        onEnter: ['$state', 'auth', function ($state, auth) {
          if (!auth.isLoggedIn()) {
            $state.go('401')
          }
        }]
      })
      .state('privacy', {
        url: '/privacy',
        templateUrl: '/views/privacy.html'
      })
      .state('terms', {
        url: '/terms',
        templateUrl: '/views/terms.html'
      })
      .state('faq', {
        url: '/faq',
        templateUrl: '/views/faq.html'
      })
      .state('401', {
        url: '/401',
        templateUrl: '/views/401.html'
      })
      .state('404', {
        url: '/404',
        templateUrl: '/views/404.html'
      })

    $urlRouterProvider.otherwise('/404')
}])
