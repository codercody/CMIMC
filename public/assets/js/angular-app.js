var app = angular.module('mainApp', ['ui.router'])

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
        templateUrl: '/views/account.html'
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

    $urlRouterProvider.otherwise('/')
}])
