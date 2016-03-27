define(['./module'], function (module) {
    "use strict";
    module.controller('DetailCtrl', DetailCtrl);

    DetailCtrl.$inject = ['bookDetail'];

    function DetailCtrl(bookDetail) {
        var vm = this;
        vm.book = bookDetail;
    }
});
