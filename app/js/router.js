define(function () {
    return function ($urlRouterProvider, $locationProvider, $stateProvider) {
        var bundle;

        /**
         * Routes
         */
        var routes = {};
        $urlRouterProvider.otherwise("/");
        $locationProvider.html5Mode(true).hashPrefix('!');
        for (var name in routes) {
            if (routes.hasOwnProperty(name)) {
                $stateProvider.state(name, routes[name]);
            }
        }
    }
});