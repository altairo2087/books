'use strict';

// init .env file
require('dotenv').config({
    silent:true
});

// plugins
var gulp = require('gulp'),
    webpack = require('webpack'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    browserSync = require('browser-sync').create(),
    historyApiFallback = require('connect-history-api-fallback'),
    plugins = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*', 'del', 'imagemin-pngquant', 'lazypipe'],
        replaceString: /\bgulp[\-.]/
    }),
    StringReplacePlugin = require("string-replace-webpack-plugin");

// server conf
const PORT = 3000;
const OPEN_BROWSER = false;
const SERVER_WATCH = true;

// folders
const APP_FOLDER = 'app';
const PUBLIC_FOLDER = 'public';
const BOWER_FOLDER = 'bower_components';

// images type to optimize
const IMAGES = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

// other files to public
const OTHER_FILES = [
    `${APP_FOLDER}/files/**/*`
];

// vendor css order
const ORDER_VENDOR_CSS = [
    "*bootstrap.*",
    "*bootstrap*"
];

// custom css order
const ORDER_CUSTOM_CSS = [
    "*"
];

var APP_DEBUG = process.env.APP_DEBUG==='true';

// app assets list
const ASSETS = {
    vendor: {
        bower: {
            js: {
                angular:'angular/angular.min.js',
                ngAnimate:'angular-animate/angular-animate.min.js',
                ngAria:'angular-aria/angular-aria.min.js',
                ngMaterial:'angular-material/angular-material.min.js',
                ngMessages:'angular-messages/angular-messages.min.js',
                ngResource:'angular-resource/angular-resource.min.js',
                uiRouter:'angular-ui-router/release/angular-ui-router.min.js'
            },
            css: [
                'angular-material/angular-material.min.css'
            ],
            other: []
        }
    }
};

//
function log() {
    plugins.util.log.apply({}, arguments);
}

function clean() {
    log(`cleaning '${PUBLIC_FOLDER}' folder...`);
    return plugins.del([
        `${PUBLIC_FOLDER}/**`,
        `!${PUBLIC_FOLDER}`,
        `!${PUBLIC_FOLDER}/.gitkeep`
    ]);
}

function filter(types, restore) {
    if (typeof restore === 'undefined') {
        restore = true;
    }
    return plugins.filter(types, {
        restore: restore
    });
}

function setEnv(name) {
    var filename = `.env.${name}`;
    return fs.stat(filename, function (err, stats) {
        if (err) {
            log(`unknown environment`);
        }
        else {
            fs.createReadStream(filename).pipe(fs.createWriteStream('.env'));
        }
    });
}

function tackList() {
    log(`----- available tasks -----`);
    for (let name in tasks) {
        if (tasks.hasOwnProperty(name)) {
            var num = 10 - name.length,
                prefix = '';
            if (num < 0) {
                num = 0;
            }
            while (num--) {
                prefix += ' ';
            }
            log(`${prefix}${name} | ${tasks[name].desc}`);
        }
    }
    log(`---------------------------`);
}

function copyOtherFiles() {
    log(`copying other files...`);
    var q = Q.defer();
    gulp.src(OTHER_FILES, {base: APP_FOLDER})
        .pipe(gulp.dest(PUBLIC_FOLDER))
        .on('end', function(){
            q.resolve();
        });
    return q.promise;
}

function vendorCssPaths() {
    var files = [],
        arr = [].concat(
            ASSETS.vendor.bower.css,
            ASSETS.vendor.bower.other
        );
    for (let file in arr) {
        if (arr.hasOwnProperty(file)) {
            files.push(`${BOWER_FOLDER}/${arr[file]}`);
        }
    }
    return files;
}

function vendorJsPaths(min) {
    var scripts = {};
    for (let name in ASSETS.vendor.bower.js) {
        if (ASSETS.vendor.bower.js.hasOwnProperty(name)) {
            var script = ASSETS.vendor.bower.js[name];
            if (!min)
                script = script.replace('.min', '');
            scripts[name] = path.resolve(__dirname, BOWER_FOLDER, script);
        }
    }
    return scripts;
}

var HTML = {
    files: [`${APP_FOLDER}/**/*.jade`, `${APP_FOLDER}/**/*.html`],
    watch() {
        log(`watching html,jade...`);
        return plugins.watch(this.files, function(){
            this.compile();
        });
    },
    orderedVendorCss() {
        return gulp
            .src(`${PUBLIC_FOLDER}/vendor/*.css`, {
                read: false
            })
            .pipe(plugins.order(ORDER_VENDOR_CSS));
    },
    orderCustomCss() {
        return gulp
            .src([`${PUBLIC_FOLDER}/**/*.css`, `!${PUBLIC_FOLDER}/vendor/**/*`])
            .pipe(plugins.order(ORDER_CUSTOM_CSS))
            ;
    },
    transform() {
        var args = arguments;
        args[0] = args[0].replace('/public/', '');
        return plugins.inject.transform.apply(plugins.inject.transform, args);
    },
    compile(src) {
        var files;
        log(`compile html,jade...`);
        var filterJade = filter("**/*.jade");
        var filterInject = filter("**/*.inject.html");
        var q = Q.defer();

        if (src) {
            if (APP_DEBUG) {
                files = src;
            } else {
                files = gulp.src(this.files);
            }
        } else {
            files = gulp.src(this.files);
        }
        files
            .pipe(filterJade)
            .pipe(plugins.jade())
            .pipe(filterJade.restore)
            .pipe(filterInject)
            .pipe(plugins.inject(this.orderedVendorCss(), {
                name: 'bower',
                transform: this.transform
            }))
            .pipe(plugins.inject(this.orderCustomCss(), {
                transform: this.transform
            }))
            .pipe(plugins.rename(function (path) {
                path.basename = path.basename.replace('.inject', '');
            }))
            .pipe(filterInject.restore)
            .pipe(
                plugins.if(
                    APP_DEBUG,
                    plugins.prettify({indent_size: 2}),
                    plugins.htmlmin({
                        collapseWhitespace: true, conservativeCollapse: true
                    })
                ))
            .pipe(gulp.dest(PUBLIC_FOLDER))
            .on('end', function(){
                q.resolve();
            });

        return q.promise;
    }
};

var CSS = {
    files: [`${APP_FOLDER}/**/*.sass`, `${APP_FOLDER}/**/*.scss`, `${APP_FOLDER}/**/*.css`],
    watch() {
        log('watching sass,scss,css...');
        this.src(plugins.watch(this.files));
    },
    compile() {
        log('compile sass,scss,css...');
        return this.src(gulp.src(this.files));
    },
    src(src, isWatch) {
        if (isWatch && !APP_DEBUG) {
            src = gulp.src(this.files);
        }
        var filterSass = filter(["**/*.sass", "**/*.scss"]);
        src = src
            .pipe(filterSass)
            .pipe(plugins.sass())
            .pipe(filterSass.restore)
            .pipe(plugins.cssUrlAdjuster({
                //replace: ['../img', '../../img/theme']
            }));
        src = src.pipe(plugins.autoprefixer());
        if (!APP_DEBUG) {
            src = src
                .pipe(plugins.order(ORDER_CUSTOM_CSS))
                .pipe(plugins.concat('custom.css'))
                .pipe(plugins.cssmin())
        }
        return src.pipe(gulp.dest(APP_DEBUG ? PUBLIC_FOLDER : `${PUBLIC_FOLDER}/css`));
    }
};

var Image = {
    files() {
        var images = [];
        for (var i in IMAGES) {
            if (IMAGES.hasOwnProperty(i)) {
                images.push(`${APP_FOLDER}/**/*.${IMAGES[i]}`);
            }
        }
        return images;
    },
    watch() {
        log('watching images...');
        return this.src(plugins.watch(this.files()));
    },
    compile() {
        log('compile images...');
        return this.src(gulp.src(this.files()));
    },
    src(src) {
        var q = Q.defer();
        if (!APP_DEBUG) {
            src = src.pipe(plugins.imagemin({
                progressive: false,
                svgoPlugins: [{removeViewBox: false}],
                use: [plugins.imageminPngquant({speed: 10})]
            }));
        }
        src.pipe(gulp.dest(PUBLIC_FOLDER)).on('end', function(){
            q.resolve();
        });
        return q.promise;
    }
};

var JS = {
    files: [`${APP_FOLDER}/**/*.coffee`, `${APP_FOLDER}/**/*.js`],
    watch() {
        log('watching js,coffee...');
        return plugins.watch(this.files, function(){
            this.compile();
        });
    },
    compile() {
        log('compile js,coffee...');
        return webpack(getWebpackConf(!APP_DEBUG), function(err, stats){
            if (err) {
                throw new plugins.util.PluginError("webpack", err);
            }
            log("[webpack]", stats.toString({
                colors: true
            }));
        });
    }
};

function getWebpackConf(min) {
    var conf = {
        debug: true,
        entry: path.resolve(__dirname, APP_FOLDER, 'js/bootstrap'),
        output: {
            path: path.join(__dirname, PUBLIC_FOLDER, 'js'),
            filename: '[name].js'
        },
        resolve: {
            alias: vendorJsPaths(min)
        },
        plugins: [
            new StringReplacePlugin(),
            new webpack.DefinePlugin({
                APP_DEBUG: APP_DEBUG
            })
        ],
        module: {
            loaders: [
                { test: /\.coffee$/, loader: "coffee-loader" },
                { test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" },
                {
                    test: /constants.js$/,
                    loader: StringReplacePlugin.replace({
                        replacements: [
                            {
                                pattern: /<<API_HOST>>/ig,
                                replacement(match, p1, offset, string) {
                                    return process.env.API_HOST;
                                }
                            },
                            {
                                pattern: /<<APP_DEBUG>>/ig,
                                replacement(match, p1, offset, string) {
                                    return process.env.APP_DEBUG;
                                }
                            }
                        ]
                    })
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules|bower_components/,
                    loader: "babel-loader",
                    query: {
                        presets: ['es2015']
                    }
                }
            ]
        }
    };

    console.log(conf);

    if (min) {
        conf.plugins.push(new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            mangle: false
        }))
    }

    return conf;
}

function vendor() {
    log(`prepare vendor css files...`);
    var cssFilter = filter('**/*.css');
    var src = gulp.src(vendorCssPaths());
    var q = Q.defer();
    if (APP_DEBUG) {
        src = src.pipe(cssFilter)
            .pipe(plugins.cssUrlAdjuster({
                replace: ['../fonts', './']
            }))
            .pipe(plugins.cssUrlAdjuster({
                replace: ['fonts', './']
            }))
            .pipe(cssFilter.restore);
    } else {
        src = src.pipe(cssFilter)
            .pipe(plugins.cssUrlAdjuster({
                replace: ['../fonts', './']
            }))
            .pipe(plugins.cssUrlAdjuster({
                replace: ['fonts', './']
            }))
            .pipe(plugins.order(ORDER_VENDOR_CSS))
            .pipe(plugins.concat('vendor.css'))
            .pipe(plugins.csso())
            .pipe(cssFilter.restore)
    }
    src.pipe(gulp.dest(`${PUBLIC_FOLDER}/vendor`)).on('end', function(){
        q.resolve();
    });
    return q.promise;
}

function build() {
    var q = Q.defer();
    log(`debug: ${APP_DEBUG}`);
    clean().then(function(){
        Q.all([
            vendor(),
            CSS.compile(),
            Image.compile(),
            copyOtherFiles()
        ]).then(function(){
            HTML.compile().then(function(){
                JS.compile().then(function(){
                    q.resolve();
                })
            });
        });
    });
    return q.promise;
}

function server() {
    browserSync.init({
        server: {
            baseDir: PUBLIC_FOLDER,
            middleware: [historyApiFallback()]
        },
        files: SERVER_WATCH ? `${PUBLIC_FOLDER}/**/*` : false,
        port: PORT,
        open: OPEN_BROWSER,
        browser: "google chrome",
        reloadOnRestart: true,
        notify: false
    });
    HTML.watch();
    CSS.watch();
    JS.watch();
    Image.watch();
}

var tasks = {
    env: {
        desc: `set app environment`,
        action: function () {
            setEnv(plugins.util.env.env || 'dev');
        }
    },
    clean: {
        desc: `clean '${PUBLIC_FOLDER}' folder`,
        action: clean
    },
    server: {
        desc: `start local server on localhost:${PORT}`,
        action: server
    },
    build: {
        desc: `build app: '--env [prod|dev]' default 'dev'`,
        action: build
    },
    default: {
        desc: "show tasks list",
        action: tackList
    }
};

for (let name in tasks) {
    if (tasks.hasOwnProperty(name)) {
        gulp.task(name, tasks[name].action)
    }
}