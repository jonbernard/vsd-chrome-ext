/*! underwire 1.5.8 2014-12-12 */
var Underwire = function(){
  this._extensions = [];
  this.extend = function(base, exstension){
    // multiple ways of extending
    if(!exstension){
      exstension = base;
      base = this;
    }
    // register the extension
    this._extensions.push({
      creator: exstension
    });
    // extend
    $.extend(true, base, exstension());
  };
  // clone will return a unique copy of an instance of Underwire
  this.clone = function(){
    var uu = new Underwire();
    this._extensions.forEach(function(extension, index, array){
      $.extend(uu, extension.creator());
    });
    return uu;
  };
};
var UU = new Underwire();
UU.extend(function(){
  return {
    broadcast: function (moduleName, message) {
      if (!message) {
        message = moduleName;
      }
      // console.log("broadcast from", moduleName, message);
      this._broadcast.call(message.to || this, moduleName, message);
    },

    _broadcast: function(moduleName, message){
      for (var module in this._modules) {
        if (this._modules[module].started && this._modules[module].instance &&
              this._modules[module].instance.messages) {

          // work with objects
          if (typeof this._modules[module].instance.messages[message.type] === "function") {

            // multiple instances
            if (this._modules[module].instances) {
              for (var i = 0; i < this._modules[module].instances.length; i++) {
                this._modules[module].instances[i].messages[message.type].call(this._modules[module].instances[i], message);
              }
              continue;
            }

            // single instance
            this._modules[module].instance.messages[message.type].call(this._modules[module].instance, message);
          }

          // work with arrays
          if(this._modules[module].instance.onmessage &&
              $.inArray(message.type, this._modules[module].instance.messages) >= 0) {
          this._modules[module].instance.onmessage(message);
          } 
        }
      }
    }
  };
});
UU.extend(function(){

  var _windowEvents = ["resize", "scroll", "error"],
    _documentEvents = ["load", "unload"];

  return {

    // Event names listed in the `_nonBubblingEvents` array are bound
    // to the element. Events names that are not listed in this array will
    // be bound to the document.
    _nonBubblingEvents: [
      "abort", "ended", "loadedmetadata", "timeupdate", "playing", "canplay"
    ].concat(_windowEvents).concat(_documentEvents),

    // Not supported video events on IE7/8
    // TODO explain what will happen if an event is in this array.
    _nonBubblingMediaEvents: ["ended", "loadedmetadata", "timeupdate",
      "playing", "loadstart"],

    startEvent: function(module, eventHandler, eventPattern) {
      var evt = this._getEventDictionary(module, eventPattern);
      $(evt.scope).on(evt.type, evt.selector, function (event) {
        eventHandler.call(module, event, this);
      });
    },

    stopEvent: function (module, eventHandler, eventPattern) {
      var evt = this._getEventDictionary(module, eventPattern);
      $(evt.scope).off(evt.type, evt.selector);
    },

    _getEventDictionary: function(module, eventPattern) {

      // creating an event array by spliting "on:(" and ") "
      eventPattern = eventPattern.split(/:on\(|\)/);
      var scope = document;
      var selector;
      var type;

      if (eventPattern) {

        // instances scope is the element that's tightly coupled to the module
        if (module.instances) {
          scope = module.$el;
        }

        // default scope i.e. "event [optional target]"
        if (eventPattern.length === 1) {
          eventPattern = eventPattern[0].split(/ +/);
          type = eventPattern[0];

          // set the selector to the last element in the event pattern
          // or the module's scope i.e. {events:{ "click": fn },scope: ".overlay",
          if(eventPattern[1] && module.instances !== true) {
            selector = module.scope + " " + eventPattern[1];
          } else if(eventPattern[1] && module.instances === true) {
            selector = eventPattern[1];
          } else {
            selector = module.scope;
          }
        }

        // custom scope i.e. "event :on(scope) [optional target]"
        if (eventPattern.length === 3) {
          type = eventPattern[0];
          scope = eventPattern[1];
          selector = eventPattern[2];
          switch (scope) {
          case "window":
            scope = window;
            break;
          case "document":
            scope = document;
            break;
          }
        }
      }

      return {
        type: type,
        scope: scope,
        selector: selector
      };
    },


    // Start Depricated
    //
    //
    //
    //
    //
    //
    listen: function (moduleName, eventType, selector) {
      this._toggleEvents(moduleName, eventType, selector, true);
    },
    //
    //
    //
    //
    //
    //
    unlisten: function (moduleName, eventType, selector) {
      this._toggleEvents(moduleName, eventType, selector, false);
    },
    //
    //
    //
    //
    //
    //
    _toggleEvents: function (moduleName, eventType, selector, turnOn) {
      // console.log("toggleEvents: " + moduleName, (turnOn ? "on" : "off"));
      var module;
      var _this = this;
      var target = selector;
      /*
       * If eventType is one of the nonBubblingEvents, add a listener to the selector.
       */
      if ($.inArray(eventType, this._nonBubblingEvents) !== -1) {

        /*
         * Set target to the selector, or for "window" set it to window.
         */
        if(selector === "window" || $.inArray(eventType, _windowEvents) !== -1){
          target = window;
        }

        if(turnOn){
          $(target).on(eventType, function (event) {
            var moduleEventHandler = "on" + eventType;
            // first test if this is the target, then use a library
            // this was done this way for zepto... zepto failed when
            // this === window and target === window
            if ((this === target || $(this).is(target)) &&
              typeof _this._modules[moduleName].instance[moduleEventHandler] === "function") {
              _this._modules[moduleName].instance[moduleEventHandler](event, this);
            }
          });
        } else {
          $(target).off(eventType);
        }

      }

      /*
       * If eventType is one of the this._nonBubblingMediaEvents, add a listener to the selector.
       */
      else if (window.addEventListener && $.inArray(eventType, this._nonBubblingMediaEvents) !== -1) {

        var windowEventListener = function(event) {
          var moduleEventHandler = "on" + eventType;
          // make sure the event target is unique to the module's selector
          if ($(event.target).is(selector) &&
            typeof _this._modules[moduleName].instance[moduleEventHandler] === "function") {
            _this._modules[moduleName].instance[moduleEventHandler](event, event.target);
          }
        };

        if(turnOn){
          window.addEventListener(eventType, windowEventListener, true);
        } else {
          window.removeEventListener(eventType, windowEventListener, true);
        }
      }

      /*
       * Add only one event handler to the document.
       */
      else {
        /*
         * Add an event listener to the document.
         */
        if(turnOn){
          $(document).on(eventType, selector, function(event) {
            // console.log(eventType, moduleName);
            var moduleEventHandler = "on" + eventType;
            if ($(this).is(selector) &&
              typeof _this._modules[moduleName].instance[moduleEventHandler] === "function") {
              _this._modules[moduleName].instance[moduleEventHandler](event, this);
            }
          });
        } else {
          $(document).off(eventType, selector);
        }

      }
    }
    //
    //
    //
    //
    //
    //
    // End Depricated
  };
});
UU.extend(function(){
  return {

    _instanceModulesStarted: 0,

    startDomChangeListener: function (moduleName) {

      if (this._instanceModulesStarted === 0) {
        $(document)
          .on("DOMNodeInserted", {
            moduleName: moduleName
          }, $.proxy(this.DOMNodeInserted, this))
          .on("DOMNodeRemoved", {
            moduleName: moduleName
          }, $.proxy(this.DOMNodeRemoved, this));
      }

      this._instanceModulesStarted++;
    },

    stopDomChangeListener: function (moduleName) {

      this._instanceModulesStarted--;
      if (this._instanceModulesStarted === 0) {
        $(document)
          .off("DOMNodeInserted", this.DOMNodeInserted)
          .off("DOMNodeRemoved", this.DOMNodeRemoved);
      }
    },

    DOMNodeInserted: function (event) {

      if (UU._modules[event.data.moduleName].started &&
          $(event.target).is(UU._modules[event.data.moduleName].instance.scope)) {
        this._startInstance(event.data.moduleName, null, event.target);
      }
    },

    DOMNodeRemoved: function (event) {

      if ($(event.target).is(UU._modules[event.data.moduleName].instance.scope)) {
        for (var i = 0; i < UU._modules[event.data.moduleName].instances.length; i++) {
          if (UU._modules[event.data.moduleName].instances[i].$el[0] === event.target) {
            UU._modules[event.data.moduleName].instances.splice(i, 1);
          }
        }
      }
    },

    // why is there a start, startAll and _startInstance?
    _startInstance: function (moduleName, instance, el) {

      if (!instance) {
        instance = this._modules[moduleName].creator(this._modules[moduleName].sandbox);
      }

      if (el) {
        instance.$el = $(el);
      }

      if (typeof instance.init === "function") {
        instance.init();
      }

      for (var eventName in instance.events) {
        if (typeof instance.events[eventName] === "function") {
          this.startEvent(instance, instance.events[eventName], eventName);
        }
      }

      this.initPlugins(instance, moduleName);

      if (this._modules[moduleName].instances instanceof Array) {
        this._modules[moduleName].instances.push(instance);
      }
    }

  };
});
UU.extend(function(){
  return {

    log: function(){
      if(console && typeof console.log === "function"){
        console.log(arguments);
      }
    }

  };
});
UU.extend(function(){
  return {

    Mediator: function (moduleName, application) {

      return {

        $el: null,

        getService: function (id) {
          return application.getService(id);
        },

        getConfig: function (id) {
          return application.getConfig(id);
        },

        broadcast: function (message) {
          application.broadcast(moduleName, message);
        },

        getElement: function () {

          if (this.$el) {
            return this.$el;
          }

          if (application._modules[moduleName] && 
                application._modules[moduleName].instance &&
                application._modules[moduleName].instance.scope) {
            this.$el = $(application._modules[moduleName].instance.scope);
            return this.$el;
          }

          return $(moduleName);
        },

        getPageData: function (key) {
          return application.getPageData(key);
        },

        setPageData: function (key, value) {
          return application.setPageData(key, value);
        }

      };
    }
  };
});
UU.extend(function(){
  return {

    // Namespace for modules added by `this.addModule`.
    _modules: {},

    // Namespace for modules added by `this.addService`.
    _services: {},

    // Namespace for modules added by `this.addConfig`.
    _configs: {},

    _data: {},

    addConfig: function (configName, creator) {
      this._configs[configName] = {
        creator: creator
      };
    },

    addModule: function (moduleName, services, creator) {
      this._modules[moduleName] = {};

      if (creator) {
        this._modules[moduleName].creator = creator;
        this._modules[moduleName].services = services;
      } else {
        this._modules[moduleName].creator = services;
      }

    },

    addService: function (serviceName, optionalConf, creator) {
      if(!creator) {
        creator = optionalConf;
        optionalConf = null;
      }
      //console.log("addService", serviceName);
      this._services[serviceName] = {
        creator: creator,
        conf: optionalConf
      };
    },

    getConfig: function(configId) {
      //console.log("getConfig", configs[configId]);
      if(this._configs[configId]) {
        if(this._configs[configId].instance){
          return this._configs[configId].instance;
        }
        this._configs[configId].instance = this._configs[configId].creator(this);
        return this.getConfig(configId);
      }
    },

    getService: function (serviceName, creator) {
      //console.log("addService", serviceName);
      if(this._services[serviceName]) {
        // return the instance when it's there
        if(this._services[serviceName].instance){
          return this._services[serviceName].instance;
        }
        if (this._services[serviceName].conf instanceof Array) {
          var mediator = this.Mediator(serviceName, this);
          for (var i = 0; i < this._services[serviceName].conf.length; i++) {
            var service = this.getService(this._services[serviceName].conf[i]);
            if (service) {
              mediator[this._services[serviceName].conf[i]] = service;
              continue;
            }
            var global = window[this._services[serviceName].conf[i]];
            if (global) {
              mediator[this._services[serviceName].conf[i]] = global;
            }
          }
          return this._services[serviceName].creator(mediator);
        }
        // make an instance and return it when a singleton is requested in the conf
        if(this._services[serviceName].conf && this._services[serviceName].conf.singleton){
          this._services[serviceName].instance = this._services[serviceName].creator(this);
          return this.getService(serviceName, creator);
        }
        return this._services[serviceName].creator(this);
      }
    },

    getPageData: function(key) {
      return this._data[key];
    },

    removeModule: function (moduleName) {
      this.stop(moduleName);
      this._modules[moduleName] = null;
    },

    removeService: function (serviceName) {
      this._services[serviceName] = null;
    },

    setPageData: function (key, value) {
      this._data[key] = value;
    }
    // ,
    // better api?
    // addData: function(){
    //   this.setPageData.apply(this, arguments);
    // }
  };
});
UU.extend(function() {
    return {

        init: function(config) {
            this.startAll();
            this._isInitialized = true;
        },

        destroy: function() {
            this.stopAll();
            this._isInitialized = false;
        },

        isInitialized: function() {
            return this._isInitialized;
        },

        start: function(moduleName) {

            if (!this._modules[moduleName] || this._modules[moduleName].started) {
                return;
            }

            var i;
            this._modules[moduleName].sandbox = this.Mediator(moduleName, this);
            // 
            if (this._modules[moduleName].services instanceof Array) {
                for (i = 0; i < this._modules[moduleName].services.length; i++) {
                    var service = this.getService(this._modules[moduleName].services[i]);
                    if (service) {
                        this._modules[moduleName].sandbox[this._modules[moduleName].services[i]] = service;
                        continue;
                    }
                    var global = window[this._modules[moduleName].services[i]];
                    if (global) {
                        this._modules[moduleName].sandbox[this._modules[moduleName].services[i]] = global;
                    }
                }
            }

            this._modules[moduleName].instance = this._modules[moduleName].creator(this._modules[moduleName].sandbox);

            // Single instance
            if (this._modules[moduleName].instance.instances !== true) {

                if (typeof this._modules[moduleName].instance.init === "function") {
                    this._modules[moduleName].instance.init();
                }

                this.initPlugins(this._modules[moduleName].instance, moduleName);
                
                this._forEachModuleEvent(moduleName, this.listen);

            } else {

                // Multiple instances
                var $el = $(this._modules[moduleName].instance.scope);

                this._modules[moduleName].instances = [];

                for (i = 0; i < $el.length; i++) {
                    this._startInstance(moduleName, this._modules[moduleName].instances[i], $el[i]);
                }

                this.startDomChangeListener(moduleName);
            }

            this._modules[moduleName].started = true;
        },

        startAll: function() {

            for (var moduleName in this._modules) {
                if (this._modules.hasOwnProperty(moduleName)) {
                    this.start(moduleName);
                }
            }
        },

        stop: function(moduleName) {
            if (this._modules[moduleName] && this._modules[moduleName].instance) {
                if (typeof this._modules[moduleName].instance.destroy === "function") {
                    this._modules[moduleName].instance.destroy();
                }
                this._modules[moduleName].started = false;
                // Start Depricated
                this._forEachModuleEvent(moduleName, this.unlisten, this, "stop"); // underwire.events
                // End Depricated
                for (var eventName in this._modules[moduleName].instance.events) {
                    
                    // multple instances
                    // turn off event handling for each of the instances
                    if (this._modules[moduleName].instance.instances) {
                        for (var i = 0; i < this._modules[moduleName].instances.length; i++) {
                            this.stopEvent(this._modules[moduleName].instances[i], this._modules[moduleName].instances[i].events[eventName], eventName);
                        }
                        continue;
                    }

                    // handle single instance
                    if (typeof this._modules[moduleName].instance.events[eventName] === "function") {
                        this.stopEvent(this._modules[moduleName].instance, this._modules[moduleName].instance.events[eventName], eventName);
                        continue;
                    }
                }

                // Stop the Dom listener for instances
                if (this._modules[moduleName].instance.instances) {
                    this.stopDomChangeListener(moduleName);
                }
            }
        },

        stopAll: function() {
            for (var moduleName in this._modules) {
                if (this._modules.hasOwnProperty(moduleName)) {
                    this.stop(moduleName);
                }
            }
        },

        isStarted: function(moduleName) {
            return this._modules[moduleName].started;
        }
    };
});
UU.extend(function () {
  return {

    _plugins: [],

    plugin: function (name, method) {
      this._plugins[name] = method;
    },

    initPlugins: function (instance, moduleName) {
      for (var plugin in this._plugins) {
        if (plugin in instance) {
          var pluginInstance = this._plugins[plugin](instance, moduleName, this);
          if (pluginInstance.init) {
            pluginInstance.init();
          }
        }
      }
    },

    destroyPlugins: function (instance, moduleName) {
      for (var plugin in this._plugins) {
        if (plugin in instance) {
          var pluginInstance = this._plugins[plugin](instance, moduleName, this);
          if (pluginInstance.destroy) {
            pluginInstance.destroy();
          }
        }
      }
    }

  };
});
UU.plugin("rivets", function (moduleInstance, mediator) {

  return {
    init: function () {
      if (typeof rivets === "undefined") {
        return;
      }
      // give modules context to the event handler
      rivets.configure({
        handler: function(element, event, binding) {
          return this.call(moduleInstance, event, element, binding.view.models);
        }
      });

      // not sure...
      rivets.binders.update = {
        publishes: true,
        routine: rivets.binders.value.routine,
        bind: function (el) {
          el.addEventListener('change', this.publish);
        },
        unbind: function (el) {
          el.removeEventListener('change', this.publish);
        }
      };

      // add binders
      for (var binder in moduleInstance.rivets.binders) {
        rivets.binders[binder] = moduleInstance.rivets.binders[binder];
      }

      // init for rivets
      rivets.bind(moduleInstance.$el || $(moduleInstance.scope), moduleInstance.rivets);
    }
  };

});
UU.plugin("domReady", function (moduleInstance, mediator) {

  return {
    init: function () {
      $(document).ready($.proxy(moduleInstance.domReady, moduleInstance));
    }
  };
});
UU.extend(function(){
  return {
      _forEachModuleEvent: function(moduleName, callback, context, stateEvent){
      var module = this._modules[moduleName];
      if (module.instance && module.instance.events) {
        var eventName;
        // Start: Depricated
        context = context || this;
        var selector;
        var eventHandler;
        var scope = module.instance.scope;
        var moduleSelectors = moduleName.split(",");
        var currentModule;
        // End: Depricated

        for (var i = 0; i < moduleSelectors.length; i++) {
          currentModule = moduleSelectors[i];
          for (eventName in module.instance.events) {

            // Prefered syntax "event .el": fn
            if(typeof module.instance.events[eventName] === "function" && stateEvent !== "stop") {
              this.startEvent(module.instance, module.instance.events[eventName], eventName);
              continue;
            }

            // Start: Depricated
            // This was the original design - not recommended.
            if(scope){
              selector = [scope, module.instance.events[eventName]].join(" ");
            } else {
              selector = [currentModule, module.instance.events[eventName]].join(" ");
            }
            selector = selector.replace(/this\b/g, "");
            selector = selector.replace(/,/g, [",", (scope || moduleName), ""].join(" "));
            eventHandler = module.instance["on" + eventName];
            if (typeof selector === "string" && typeof eventHandler === "function") {
              callback.call(context, moduleName, eventName, selector);
            }
            // End: Depricated
          }
        }
      }
    }
  };
});