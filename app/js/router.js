define(function () {
    return function ($urlRouterProvider, $locationProvider, $stateProvider) {
        /**
         * Routes
         */
        var routes = {
            catalog: {
                url: "/catalog",
                templateUrl: "tpl/books/index.html",
                controller: 'CatalogCtrl',
                controllerAs: 'catalog',
                resolve: {
                    bookList: function(Book){
                        return Book.all();
                    }
                }
            },
            'catalogDetail': {
                url: "/catalog/:id",
                templateUrl: "tpl/books/show.html",
                controller: 'DetailCtrl',
                controllerAs: 'detail',
                resolve: {
                    bookDetail: function(Book, $stateParams){
                        return Book.find($stateParams.id);
                    }
                }
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
