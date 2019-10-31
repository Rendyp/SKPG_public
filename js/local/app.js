var app = angular.module('app', [
    'toastr',
    'darthwade.dwLoading',
    'ui.router',
    'ngStorage',
    'ui.bootstrap',
    'chart.js'
]);

function isNullOrEmpty(value) {
    return !value;
}
app.controller('AppCtrl', function () {

});
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $localStorageProvider, $httpProvider, $locationProvider) {
    $localStorageProvider.setKeyPrefix('api');
    $stateProvider
        .state('app', {
            url: '/',
            abstract: true,
            template: '<ui-view/>',
            controller: 'AppCtrl'
        })
        .state('app.index', {
            url: '',
            templateUrl: 'view/page/single/index.html',
            controller: 'BerandaCtrl'
        })
        
    //check browser support
    if (window.history && window.history.pushState) {
        //$locationProvider.html5Mode(true); will cause an error $location in HTML5 mode requires a  tag to be present! Unless you set baseUrl tag after head tag like so: <head> <base href="/">

        // to know more about setting base URL visit: https://docs.angularjs.org/error/$location/nobase

        // if you don't wish to set base URL then use this
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
    $urlRouterProvider.otherwise('/');
    $httpProvider.interceptors.push(function ($localStorage) {
        return {
            'request': function (config) {
                if ($localStorage.token) {
                    config.headers.Authorization = "Bearer " + $localStorage.token;
                }
                if (config.headers.upload == undefined) {
                    config.headers["Content-Type"] = "application/json";
                }
                return config;
            }
        };
    });
});
app.run(run);

function run($rootScope, $localStorage, config, $http, $filter, $timeout, $state, $stateParams, $transitions) {
    // $rootScope.$state = $state;
    $rootScope.doLogout = function () {
        $localStorage.$reset();
        $state.go('app.login');
    }
    $transitions.onSuccess({}, trans => {
        $rootScope.state = trans.to();
        console.log($rootScope.state);
    });
    $rootScope.config = config;
    $rootScope.params = $stateParams;
    $rootScope.storage = $localStorage;
    console.log("eaea")
}