define(['./module'], function (module) {

    let def = {
        lang: 'ru-RU',
        title: 'Books app',
        desc: 'books description'
    };

    module.factory('layout', layout);

    layout.$inject = ['lodash'];

    function layout(_) {
        return {
            get(key) {
                if (!_.isUndefined(def[key])) {
                    return def[key];
                } else {
                    throw new Error(`layout: Getting unknown layout property '${key}'`);
                }
            },
            set(key, val) {
                if (_.has(def, key) && !_.isUndefined(val)) {
                    return def[key] = val;
                } else {
                    throw new Error(`layout: Setting unknown layout property '${key}' with '${val}'`);
                }
            }
        };
    }
});
