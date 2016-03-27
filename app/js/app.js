define([
    'angular',
    './config',
    './constants',
    'uiRouter',
    'ngAnimate',
    'ngAria',
    'ngMessages',
    'ngMaterial',
    './controllers/index',
    './directives/index',
    './services/index',
    './models/index'
], function (ng, config, constants) {

    run.$inject = [];
    function run() {}

    var app = angular.module('app', [
            'ui.router',
            'ngMaterial',
            'app.controllers',
            'app.services',
            'app.directives',
            'app.models'
        ])
        .config(config)
        .run(run);

    angular.forEach(constants, function (v, k) {
        app.constant(k, v);
    });
});
