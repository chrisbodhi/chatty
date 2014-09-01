(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Emitter, cmitter = 'emitter'

try {
    Emitter = require(cmitter)
} catch (e) {
    Emitter = require('component-emitter')
}

function Speech (options) {

    // default options
    this.options = {
        debugging: false,
        continuous: false,
        interimResults: false,
        autoRestart: false
    }

    // merge user options
    if (Object.prototype.toString.call(options) === '[object Object]') {
        for (var op in options) {
            this.options[op] = options[op]
        }
    }

    this.active         = false
    this.manualStopped  = false
    this.history        = []
    this.lastIndex      = -1
    this.lastResult     = ''
    this.recognition    = new webkitSpeechRecognition()

    var rec = this.recognition,
        self = this

    rec.continuous = self.options.continuous
    rec.interimResults = self.options.interimResults
    if (options.lang) rec.lang = options.lang

    rec.onstart = function () {
        self.active = true
        this.manualStopped = false
        self.emit('start')
    }

    rec.onresult = function (e) {
        if (!e.results || !e.results.length) return

        var updatedResult = e.results[e.resultIndex],
            transcript = updatedResult[0].transcript.replace(/^\s*/, '')

        // new sentence?
        if (e.resultIndex !== self.lastIndex) {
            self.lastIndex = e.resultIndex
            self.lastResult = ''
        }

        // avoid some redundancy
        if (transcript === self.lastResult && !updatedResult.isFinal) return
        if (transcript.length < self.lastResult.length) return

        self.lastResult = transcript

        if (updatedResult.isFinal) {
            // final sentence! we can do work!
            self.history.push(transcript)
            self.emit('finalResult', transcript)
        } else {
            // interim, let's update stuff on screen
            self.emit('interimResult', transcript)
        }
        
        if (self.options.debugging) {
            console.log(transcript + (updatedResult.isFinal ? ' (final)' : ''))
        }
    }

    rec.onerror = function (e) {
        self.emit('error', e)
    }

    rec.onend = function () {
        self.active = false
        self.history    = []
        self.lastIndex  = -1
        self.lastResult = ''
        self.emit('end')
        if (self.options.autoRestart && !self.manualStopped) {
            self.start()
        }
    }

    Emitter(this)

}

Speech.prototype.start = function () {
    if (this.active) return
    this.recognition.start()
}

Speech.prototype.stop = function () {
    if (!this.active) return
    this.manualStopped = true
    this.recognition.stop()
}

module.exports = Speech
},{"component-emitter":2}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){
var Speech = require('./node_modules/speechjs/index.js');

// var recognizer = new Speech({
//     lang: 'en-US', // default is English.
//     // all boolean options default to false
//     debugging: true, // will console.log all results
//     continuous: true, // will not stop after one sentence
//     interimResults: true, // trigger events on iterim results
//     autoRestart: true, // recommended when using continuous:true
//                       // because the API sometimes stops itself
//                       // possibly due to network error.
// });

// // simply listen to events
// // chainable API
// recognizer
//     .on('start', function () {
//         console.log('started');
//     })
//     .on('end', function () {
//         console.log('ended');
//     })
//     .on('error', function (event) {
//         console.log(event.error);
//     })
//     .on('interimResult', function (msg) {
//         document.body.innerHTML = msg;
//     })
//     .on('finalResult', function (msg) {
//         document.body.innerHTML = msg;
//     })
//     .start();

var text = document.getElementById('text')

var speech = new Speech({
  debugging: true,
  continuous: true,
  interimResults: true,
  autoRestart: true
})

speech
  .on('start', function () {
      text.innerHTML = 'Come on, talk to me.'
  })
  .on('end', function () {
      text.innerHTML = 'Stopped listening.'
  })
  .on('interimResult', function (msg) {
      text.innerHTML = msg
  })
  .on('finalResult', function (msg) {
      text.innerHTML = msg
  })
  .start()
},{"./node_modules/speechjs/index.js":1}]},{},[3]);
