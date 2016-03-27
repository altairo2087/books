define([
    'angular',
    './config',
    './constants',
    'uiRouter'
], function (ng, config, constants) {

    run.$inject = [];
    function run() {}

    var app = angular.module('app', [
            'ui.router'
        ])
        .config(config)
        .run(run);

    angular.forEach(constants, function (v, k) {
        app.constant(k, v);
    });
});