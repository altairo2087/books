define(['./module'], function (module) {
    "use strict";
    module.controller('CatalogCtrl', CatalogCtrl);

    CatalogCtrl.$inject = ['bookList'];

    function CatalogCtrl(bookList) {
        var vm = this;
        vm.books = bookList;
    }
});
