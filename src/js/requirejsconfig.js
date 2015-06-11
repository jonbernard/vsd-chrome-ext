/* jshint strict: false */
var require = {
    baseUrl: "/resources/js",
    paths: {
        'base/require': 'base/require',
        'placeme': 'base/placeMe-1.0',

        // libs
        'jquery': 'base/jquery-1.11.2',
        'modernizr': 'base/modernizr',
        'imgpreload': 'base/jquery.imgpreload',
        'postmessage': 'base/jquery.ba-postmessage',
        'handlebars': 'base/handlebars.runtime',
        'underwire': 'base/underwire',
        'lodash': 'base/lodash.compat'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'lodash': {
            exports: '_'
        },
        'base/jquery.hammer': {
            exports: '$',
            deps: ['base/hammer', 'jquery']
        },
        'base/jquery.modal': {
            exports: '$',
            deps: ['jquery']
        },
        'postmessage': {
            exports: '$',
            deps: ['jquery']
        },
        'imgpreload': {
            exports: '$',
            deps: ['jquery']
        },
        'coremetrics': {
            exports: ''
        },
        'modernizr': {
            exports: 'Modernizr'
        },
        'placeme': {
            exports: '$',
            deps: ['jquery']
        },
        'underwire': {
            deps: ['jquery'],
            exports: 'UU'
        }

    }
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return require;
}));
