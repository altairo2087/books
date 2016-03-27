define(['./app', './router'], function (app, router) {
    config.$inject = [
        '$stateProvider',
        '$urlRouterProvider',
        '$locationProvider',
        '$compileProvider'
    ];
    function config($stateProvider,
                    $urlRouterProvider,
                    $locationProvider,
                    $compileProvider){
        $compileProvider.debugInfoEnabled(APP_DEBUG==='true');
        router($urlRouterProvider, $locationProvider, $stateProvider);
    }
    return config;
});
