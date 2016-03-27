define(['./module', 'ngResource'], function (module) {

    var PATH = '/public/catalog/:id';

    module.factory('Book', book);

    book.$inject = ['$resource','API_HOST', '$q','Storage'];

    function book($resource, API_HOST, $q, Storage) {
        var resource = $resource(API_HOST + PATH);
        return {
            find(id) {
                var q = $q.defer();
                resource.get({id:id}).$promise.then(function(data){
                    var out = {
                        id: data.id,
                        title: data.title.default,
                        cover: data.cover
                    };
                    q.resolve(out);
                }, function(){
                    q.reject();
                });
                return q.promise;
            },
            all() {
                var q = $q.defer();
                resource.query().$promise.then(function(data){
                    var out = [];
                    for (var i in data) {
                        if (data.hasOwnProperty(i)) {
                            var item = data[i];
                            if (item.constructor.name==='Resource') {
                                out.push({
                                    id: item.id,
                                    title: item.title.default,
                                    desc: item.description.default,
                                    coverUrl: Storage(item.cover)
                                });
                            }
                        }
                    }
                    q.resolve(out);
                }, function(){
                    q.reject();
                });
                return q.promise;
            }
        };
    }
});
