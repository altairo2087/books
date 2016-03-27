define(['./module', 'lodash'], function(module, lodash) {
    module.factory('lodash', getLodash);

    function getLodash() {
        return lodash;
    }
});
