define(function () {
    return function ($urlRouterProvider, $locationProvider, $stateProvider) {
        var bundle;

        /**
         * Routes
         */
        var routes = {
            catalog: {
                url: "/catalog",
                templateUrl: "tpl/books/index.html"
            },
            'catalogShow': {
                url: "/catalog/:id",
                templateUrl: "tpl/books/show.html"
            }
        };

        $urlRouterProvider.otherwise("/catalog");
        $locationProvider.html5Mode(true).hashPrefix('!');

        for (var name in routes) {
            if (routes.hasOwnProperty(name)) {
                $stateProvider.state(name, routes[name]);
            }
        }
    }
});
