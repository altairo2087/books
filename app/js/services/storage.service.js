define(['./module'], function(module) {
    module.service('Storage', storage);

    storage.$inject = ['STORAGE_HOST'];
    function storage(STORAGE_HOST) {
        return function(id){
            return STORAGE_HOST.replace('{resourceId}', id);
        };
    }
});
