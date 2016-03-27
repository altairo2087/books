define(['./module'], function (module) {

    module.directive("appLayout", appLayout);

    appLayout.$inject = ['layout'];
    /* @ngInject */
    function appLayout(layout) {
        return {
            link(scope, el) {
                let value = layout.get(scope.prop);
                if (scope.attr) {
                    return el.attr(scope.attr, value);
                } else {
                    return el.text(value);
                }
            },
            restrict: "A",
            scope: {
                attr: "@layoutAttr",
                prop: "@appLayout"
            }
        };
    }
});
