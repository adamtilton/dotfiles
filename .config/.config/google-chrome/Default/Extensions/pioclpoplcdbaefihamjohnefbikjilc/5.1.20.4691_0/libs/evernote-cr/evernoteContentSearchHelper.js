/*
 * Evernote
 * core.js - Core definition and name space of the Evernote client side framework.
 * 
 * Created by Pavel Skaldin on 2/24/11
 * Copyright 2011 Evernote Corp. All rights reserved.
 */

/**
 * Base name-space
 */
var Evernote = Evernote || {};

/**
 * Class-like inheritance.
 */
Evernote.inherit = function(childClass, parentClassOrObject, includeConstructorDefs) {
    if (typeof parentClassOrObject.constructor == 'function') {
        // Normal Inheritance
        childClass.prototype = new parentClassOrObject;
        childClass.prototype.constructor = childClass;
        childClass.parent = parentClassOrObject.prototype;
        // childClass.prototype.constructor.parent = parentClassOrObject;
    } else {
        // Pure Virtual Inheritance
        childClass.prototype = parentClassOrObject;
        childClass.prototype.constructor = childClass;
        childClass.parent = parentClassOrObject;
        // childClass.constructor.parent = parentClassOrObject;
    }
    if (includeConstructorDefs) {
        for (var i in parentClassOrObject.prototype.constructor) {
            if (i != "parent"
            && i != "prototype"
            && i != "javaClass"
            && parentClassOrObject.constructor[i] != parentClassOrObject.prototype.constructor[i]) {
                childClass.prototype.constructor[i] = parentClassOrObject.prototype.constructor[i];
            }
        }
    }
    if (typeof childClass.prototype.handleInheritance == 'function') {
        childClass.prototype.handleInheritance.apply(childClass, [childClass,
        parentClassOrObject, includeConstructorDefs]);
    }
    // return childClass;
};

/**
 * Tests whether childClass inherits from parentClass in a class-like manner
 * (see Evernote.inherit())
 */
Evernote.inherits = function(childClass, parentClass) {
    var cur = childClass;
    while (cur && typeof cur.parent != 'undefined') {
        if (cur.parent.constructor == parentClass) {
            return true;
        } else {
            cur = cur.parent.constructor;
        }
    }
    return false;
    // return (typeof childClass.parent != 'undefined' &&
    // childClass.parent.constructor == parentClass);
};

Evernote.mixin = function(classOrObject, mixin, map) {
    var target = (typeof classOrObject == 'function') ? classOrObject.prototype
    : classOrObject;
    for (var i in mixin.prototype) {
        var from = to = i;
        if (typeof map == 'object' && map && typeof map[i] != 'undefined') {
            to = map[i];
        }
        target[to] = mixin.prototype[from];
    }
};

Evernote.extendObject = function(obj, extObj, deep) {
    if (typeof extObj == 'object' && extObj != null) {
        for (var i in extObj) {
            if (deep && typeof extObj[i] == 'object' && extObj[i] != null
            && typeof obj[i] == 'object' && obj[i] != null) {
                Evernote.extendObject(obj[i], extObj[i], deep);
            } else {
                try {
                    obj[i] = extObj[i];
                } catch(e){
                    // do nothing... there could have been a getter/setter lookup issue, which dont' care about
                }
            }
        }
    }
};

Evernote.hasOwnProperty = function(obj, propName) {
    if (typeof obj == 'object') {
        if (obj.hasOwnProperty(propName)) {
            return true;
        }
        var proto = null;
        var o = obj;
        while (proto = o.__proto__) {
            if (proto.hasOwnProperty(propName)) {
                return true;
            } else {
                o = proto;
            }
        }
    }
    return false;
};

/*
 * Evernote.Logger
 * Evernote
 * 
 * Created by Pavel Skaldin on 8/4/09
 * Copyright 2010 Evernote Corp. All rights reserved.
 */
/**
 * Generic Evernote.Logger. Uses various specific implementations. See
 * Evernote.LoggerImpl for details on implementing specific implementations. Use
 * Evernote.LoggerImplFactory to get specific implementations...
 * 
 * @param level
 * @param logImplementor
 * @return
 */
Evernote.Logger = function Logger(scope, level, logImplementor) {
  this.__defineGetter__("level", this.getLevel);
  this.__defineSetter__("level", this.setLevel);
  this.__defineGetter__("scope", this.getScope);
  this.__defineSetter__("scope", this.setScope);
  this.__defineGetter__("scopeName", this.getScopeName);
  this.__defineGetter__("scopeNameAsPrefix", this.getScopeNameAsPrefix);
  this.__defineGetter__("useTimestamp", this.isUseTimestamp);
  this.__defineSetter__("useTimestamp", this.setUseTimestamp);
  this.__defineGetter__("usePrefix", this.isUsePrefix);
  this.__defineSetter__("usePrefix", this.setUsePrefix);
  this.__defineGetter__("enabled", this.isEnabled);
  this.__defineSetter__("enabled", this.setEnabled);
  this.scope = scope || arguments.callee.caller;
  this.level = level;
  if (typeof logImplementor != 'undefined'
      && logImplementor instanceof Evernote.LoggerImpl) {
    this.impl = logImplementor;
  } else {
    var _impl = Evernote.LoggerImplFactory.getImplementationFor(navigator);
    if (_impl instanceof Array) {
      this.impl = new Evernote.LoggerChainImpl(this, _impl);
    } else {
      this.impl = new _impl(this);
    }
  }
};

// Evernote.Logger levels.
Evernote.Logger.LOG_LEVEL_DEBUG = 0;
Evernote.Logger.LOG_LEVEL_INFO = 1;
Evernote.Logger.LOG_LEVEL_WARN = 2;
Evernote.Logger.LOG_LEVEL_ERROR = 3;
Evernote.Logger.LOG_LEVEL_EXCEPTION = 4;
Evernote.Logger.LOG_LEVEL_OFF = 5;
Evernote.Logger.GLOBAL_LEVEL = Evernote.Logger.LOG_LEVEL_ERROR;

Evernote.Logger.DEBUG_PREFIX = "[DEBUG] ";
Evernote.Logger.INFO_PREFIX = "[INFO] ";
Evernote.Logger.WARN_PREFIX = "[WARN] ";
Evernote.Logger.ERROR_PREFIX = "[ERROR] ";
Evernote.Logger.EXCEPTION_PREFIX = "[EXCEPTION] ";

Evernote.Logger._instances = {};

Evernote.Logger.getInstance = function(scope) {
  scope = scope || arguments.callee.caller;
  var scopeName = (typeof scope == 'function') ? scope.name
      : scope.constructor.name;
  if (typeof this._instances[scopeName] == 'undefined') {
    this._instances[scopeName] = new Evernote.Logger(scope);
  }
  return this._instances[scopeName];
};
Evernote.Logger.setInstance = function(logger) {
  this._instance = logger;
};
Evernote.Logger.destroyInstance = function(scope) {
  scope = scope || arguments.callee.caller;
  var scopeName = (typeof scope == 'function') ? scope.name
      : scope.constructor.name;
  delete this._instances[scopeName];
  // Evernote.Logger._instance = null;
};
Evernote.Logger.setGlobalLevel = function(level) {
  var l = parseInt(level);
  if (isNaN(l)) {
    return;
  }
  Evernote.Logger.GLOBAL_LEVEL = l;
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(l);
    }
  }
};
Evernote.Logger.setLevel = function(level) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(level);
    }
  }
};
Evernote.Logger.enableImplementor = function(clazz) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].enableImplementor(clazz);
    }
  }
  if (clazz) {
    clazz.protoEnabled = true;
  }
};
Evernote.Logger.disableImplementor = function(clazz) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].disableImplementor(clazz);
    }
  }
  if (clazz) {
    clazz.protoEnabled = false;
  }
};

Evernote.Logger.prototype._level = 0;
Evernote.Logger.prototype._scope = null;
Evernote.Logger.prototype._usePrefix = true;
Evernote.Logger.prototype._useTimestamp = true;
Evernote.Logger.prototype._enabled = true;

Evernote.Logger.prototype.getImplementor = function(clazz) {
  if (clazz) {
    return this.impl.answerImplementorInstance(clazz);
  } else {
    return this.impl;
  }
};
Evernote.Logger.prototype.enableImplementor = function(clazz) {
  if (clazz) {
    var i = this.getImplementor(clazz);
    if (i) {
      i.enabled = true;
    }
  } else {
    this.impl.enabled = true;
  }
};
Evernote.Logger.prototype.disableImplementor = function(clazz) {
  if (clazz) {
    var i = this.getImplementor(clazz);
    if (i) {
      i.enabled = false;
    }
  } else {
    this.impl.enabled = false;
  }
};

Evernote.Logger.prototype.setLevel = function(level) {
  this._level = parseInt(level);
  if (isNaN(this._level)) {
    this._level = Evernote.Logger.GLOBAL_LEVEL;
  }
};

Evernote.Logger.prototype.getLevel = function() {
  return this._level;
};

Evernote.Logger.prototype.setScope = function(fnOrObj) {
  if (typeof fnOrObj == 'function') {
    this._scope = fnOrObj;
  } else if (typeof fnOrObj == 'object' && fnOrObj != null) {
    this._scope = fnOrObj.constructor;
  }
};

Evernote.Logger.prototype.getScope = function() {
  return this._scope;
};

Evernote.Logger.prototype.getScopeName = function() {
  if (this.scope) {
    return this.scope.name;
  } else {
    return "";
  }
};

Evernote.Logger.prototype.getScopeNameAsPrefix = function() {
  var scopeName = this.scopeName;
  return (scopeName) ? "[" + scopeName + "] " : "";
};

Evernote.Logger.prototype._padNumber = function(num, len) {
  var padStr = "0";
  num = parseInt(num);
  if (isNaN(num)) {
    num = 0;
  }
  var isPositive = (num >= 0) ? true : false;
  var numStr = "" + Math.abs(num);
  while (numStr.length < len) {
    numStr = padStr + numStr;
  }
  if (!isPositive) {
    numStr = "-" + numStr;
  }
  return numStr;
};

Evernote.Logger.prototype.getPrefix = function(pfx) {
  var str = "";
  if (this.useTimestamp) {
    var d = new Date();
    var mo = this._padNumber((d.getMonth() + 1), 2);
    var dd = this._padNumber(d.getDate(), 2);
    var h = this._padNumber(d.getHours(), 2);
    var m = this._padNumber(d.getMinutes(), 2);
    var s = this._padNumber(d.getSeconds(), 2);
    var tz = this._padNumber((0 - (d.getTimezoneOffset() / 60) * 100), 4);
    str += mo + "/" + dd + "/" + d.getFullYear() + " " + h + ":" + m + ":" + s
        + "." + d.getMilliseconds() + " " + tz + " ";
  }
  if (this.usePrefix) {
    str += pfx;
  }
  str += this.scopeNameAsPrefix;
  return str;
};

Evernote.Logger.prototype.isUsePrefix = function() {
  return this._usePrefix;
};
Evernote.Logger.prototype.setUsePrefix = function(bool) {
  this._usePrefix = (bool) ? true : false;
};

Evernote.Logger.prototype.isUseTimestamp = function() {
  return this._useTimestamp;
};
Evernote.Logger.prototype.setUseTimestamp = function(bool) {
  this._useTimestamp = (bool) ? true : false;
};

Evernote.Logger.prototype.isEnabled = function() {
  return this._enabled;
};
Evernote.Logger.prototype.setEnabled = function(bool) {
  this._enabled = (bool) ? true : false;
};

Evernote.Logger.prototype.isDebugEnabled = function() {
  return (this.enabled && this.level <= Evernote.Logger.LOG_LEVEL_DEBUG);
};

// Dumps an objects properties and methods to the console.
Evernote.Logger.prototype.dump = function(obj) {
  if (this.enabled && this.impl.enabled) {
    this.impl.dir(obj);
  }
};

// Same as dump
Evernote.Logger.prototype.dir = function(obj) {
  if (this.enabled && this.impl.enabled) {
    this.impl.dir(obj);
  }
};

// Dumps a stracktrace to the console.
Evernote.Logger.prototype.trace = function() {
  if (this.enabled && this.impl.enabled) {
    this.impl.trace();
  }
};

// Prints a debug message to the console.
Evernote.Logger.prototype.debug = function(str) {
  if (this.enabled && this.impl.enabled
      && this.level <= Evernote.Logger.LOG_LEVEL_DEBUG) {
    this.impl.debug(this.getPrefix(this.constructor.DEBUG_PREFIX) + str);
  }
};

// Prints an info message to the console.
Evernote.Logger.prototype.info = function(str) {
  if (this.enabled && this.impl.enabled
      && this.level <= Evernote.Logger.LOG_LEVEL_INFO) {
    this.impl.info(this.getPrefix(this.constructor.INFO_PREFIX) + str);
  }
};

// Prints a warning message to the console.
Evernote.Logger.prototype.warn = function(str) {
  if (this.enabled && this.impl.enabled
      && this.level <= Evernote.Logger.LOG_LEVEL_WARN) {
    this.impl.warn(this.getPrefix(this.constructor.WARN_PREFIX) + str);
  }
};

// Prints an error message to the console.
Evernote.Logger.prototype.error = function(str) {
  if (this.enabled && this.impl.enabled
      && this.level <= Evernote.Logger.LOG_LEVEL_ERROR) {
    this.impl.error(this.getPrefix(this.constructor.ERROR_PREFIX) + str);
  }
};

Evernote.Logger.prototype.exception = function(str) {
  if (this.enabled && this.impl.enabled
      && this.level <= Evernote.Logger.LOG_LEVEL_EXCEPTION) {
    this.impl
        .exception(this.getPrefix(this.constructor.EXCEPTION_PREFIX) + str);
  }
};

Evernote.Logger.prototype.alert = function(str) {
  if (this.enabled && this.impl.enabled) {
    this.impl.alert(str);
  }
};

Evernote.Logger.prototype.clear = function() {
  this.impl.clear();
};

/**
 * Abstract for variuos logger implementations
 * 
 * @author pasha
 */
Evernote.LoggerImpl = function LoggerImpl(logger) {
  this.__defineGetter__("logger", this.getLogger);
  this.__defineSetter__("logger", this.setLogger);
  this.__defineGetter__("enabled", this.isEnabled);
  this.__defineSetter__("enabled", this.setEnabled);
  this.__defineGetter__("protoEnabled", this.isProtoEnabled);
  this.__defineSetter__("protoEnabled", this.setProtoEnabled);
  this.initialize(logger);
};
Evernote.LoggerImpl.ClassRegistry = new Array();
Evernote.LoggerImpl.isResponsibleFor = function(navigator) {
  return false;
};

Evernote.LoggerImpl.prototype.handleInheritance = function(child, parent) {
  Evernote.LoggerImpl.ClassRegistry.push(child);
};

Evernote.LoggerImpl.prototype._logger = null;
Evernote.LoggerImpl.prototype._enabled = false;

Evernote.LoggerImpl.prototype.initialize = function(logger) {
  this.logger = logger;
};
Evernote.LoggerImpl.prototype.answerImplementorInstance = function(clazz) {
  if (this.constructor == clazz) {
    return this;
  }
};
Evernote.LoggerImpl.prototype.isEnabled = function() {
  return this._enabled;
};
Evernote.LoggerImpl.prototype.setEnabled = function(bool) {
  this._enabled = (bool) ? true : false;
};
Evernote.LoggerImpl.prototype.isProtoEnabled = function() {
  return this.constructor.prototype._enabled;
};
Evernote.LoggerImpl.prototype.setProtoEnabled = function(bool) {
  this.constructor.prototype._enabled = (bool) ? true : false;
};
Evernote.LoggerImpl.prototype.getLogger = function() {
  return this._logger;
};
Evernote.LoggerImpl.prototype.setLogger = function(logger) {
  if (logger instanceof Evernote.Logger) {
    this._logger = logger;
  }
};
Evernote.LoggerImpl.prototype.dir = function(obj) {
};
Evernote.LoggerImpl.prototype.trace = function() {
};
Evernote.LoggerImpl.prototype.debug = function(str) {
};
Evernote.LoggerImpl.prototype.info = function(str) {
};
Evernote.LoggerImpl.prototype.warn = function(str) {
};
Evernote.LoggerImpl.prototype.error = function(str) {
};
Evernote.LoggerImpl.prototype.exception = function(str) {
};
Evernote.LoggerImpl.prototype.alert = function(str) {
};
Evernote.LoggerImpl.prototype.clear = function() {
};

/**
 * Simple Chain implementation
 * 
 * @param logger
 * @param impls
 */
Evernote.LoggerChainImpl = function LoggerChainImpl(logger, impls) {
  this.initialize(logger, impls);
};
Evernote.inherit(Evernote.LoggerChainImpl, Evernote.LoggerImpl, true);

Evernote.LoggerChainImpl.prototype._impls = null;
Evernote.LoggerChainImpl.prototype._enabled = true;

Evernote.LoggerChainImpl.prototype.initialize = function(logger, impls) {
  Evernote.LoggerChainImpl.parent.initialize.apply(this, [ logger ]);
  var _impls = [].concat(impls);
  this._impls = [];
  for ( var i = 0; i < _impls.length; i++) {
    var _i = _impls[i];
    this._impls.push(new _i(logger));
  }
};
Evernote.LoggerChainImpl.prototype.answerImplementorInstance = function(clazz) {
  for ( var i = 0; i < this._impls.length; i++) {
    var ii = this._impls[i].answerImplementorInstance(clazz);
    if (ii) {
      return ii;
    }
  }
};
Evernote.LoggerChainImpl.prototype.dir = function(obj) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].dir(obj);
    }
  }
};
Evernote.LoggerChainImpl.prototype.trace = function() {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].trace(obj);
    }
  }
};
Evernote.LoggerChainImpl.prototype.debug = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].debug(str);
    }
  }
};
Evernote.LoggerChainImpl.prototype.info = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].info(str);
    }
  }
};
Evernote.LoggerChainImpl.prototype.warn = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].warn(str);
    }
  }
};
Evernote.LoggerChainImpl.prototype.error = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].error(str);
    }
  }
};
Evernote.LoggerChainImpl.prototype.exception = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].exception(str);
    }
  }
};
Evernote.LoggerChainImpl.prototype.alert = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].alert(str);
    }
  }
};
Evernote.LoggerChainImpl.prototype.clear = function() {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].clear();
    }
  }
};

/**
 * Factory of Logger implementations
 * 
 * @author pasha
 */
Evernote.LoggerImplFactory = {
  getImplementationFor : function(navigator) {
    var reg = Evernote.LoggerImpl.ClassRegistry;
    var impls = [];
    for ( var i = 0; i < reg.length; i++) {
      if (typeof reg[i] == 'function'
          && typeof reg[i].isResponsibleFor == 'function'
          && reg[i].isResponsibleFor(navigator)) {
        impls.push(reg[i]);
      }
    }
    if (impls.length == 0) {
      return Evernote.LoggerImpl;
    } else if (impls.length == 1) {
      return impls[0];
    }
    return impls;
  }
};

/**
 * WebKit specific logger implementation to be used with WRT's logger
 * 
 * @author pasha
 */
Evernote.WebKitLoggerImpl = function WebKitLoggerImpl(logger) {
  this.initialize(logger);
};
Evernote.inherit(Evernote.WebKitLoggerImpl, Evernote.LoggerImpl, true);
Evernote.WebKitLoggerImpl.isResponsibleFor = function(navigator) {
  return navigator.userAgent.toLowerCase().indexOf("AppleWebKit/") > 0;
};
Evernote.WebKitLoggerImpl.prototype._enabled = true;

Evernote.WebKitLoggerImpl.prototype.dir = function(obj) {
  console.group(this.logger.scopeName);
  console.dir(obj);
  console.groupEnd();
};
Evernote.WebKitLoggerImpl.prototype.trace = function() {
  console.group(this.logger.scopeName);
  console.trace();
  console.groupEnd();
};
Evernote.WebKitLoggerImpl.prototype.debug = function(str) {
  console.debug(str);
};
Evernote.WebKitLoggerImpl.prototype.info = function(str) {
  console.info(str);
};
Evernote.WebKitLoggerImpl.prototype.warn = function(str) {
  console.warn(str);
};
Evernote.WebKitLoggerImpl.prototype.error = function(str) {
  console.error(str);
};
Evernote.WebKitLoggerImpl.prototype.exception = function(str) {
  console.error(str);
  this.trace();
};
Evernote.WebKitLoggerImpl.prototype.alert = function(str) {
  alert(str);
};


Evernote.Semaphore = function(signals) {
  this.__defineGetter__("excessSignals", this.getExcessSignals);
  this.initialize(signals);
};

Evernote.inherit(Evernote.Semaphore, Array);

Evernote.Semaphore.mutex = function() {
  var sema = new Evernote.Semaphore();
  sema.signal();
  return sema;
};

Evernote.Semaphore.prototype._excessSignals = 0;
Evernote.Semaphore.prototype.initialize = function(signals) {
  this._excessSignals = parseInt(signals);
  if (isNaN(this._excessSignals)) {
    this._excessSignals = 0;
  }
};
Evernote.Semaphore.prototype.getExcessSignals = function() {
  return this._excessSignals;
};
Evernote.Semaphore.prototype.hasExcessSignals = function() {
  return (this._excessSignals > 0) ? true : false;
};
Evernote.Semaphore.prototype.signal = function() {
  if (this.length == 0) {
    this._excessSignals++;
  } else {
    this._processNext();
  }
};
Evernote.Semaphore.prototype.wait = function() {
  if (this._excessSignals > 0) {
    this._excessSignals--;
    this._processNext();
  }
};
Evernote.Semaphore.prototype.critical = function(fn) {
  var self = this;
  var f = function() {
    try {
      fn();
    } catch (e) {
      self.signal();
      throw (e);
    }
  };
  f._semaOrigFn = fn;
  this.push(f);
  this.wait();
};
Evernote.Semaphore.prototype.wave = function() {
  if (this.length > 0) {
    this.shift();
  }
};
Evernote.Semaphore.prototype.waveAll = function() {
  if (this.length > 0) {
    this.splice(0, this.length);
  }
};
Evernote.Semaphore.prototype.waveEach = function(fn) {
  var i = 0;
  while (i < this.length) {
    if (fn(this[i]._semaOrigFn)) {
      this.splice(i, 1);
    } else {
      i++;
    }
  }
};
Evernote.Semaphore.prototype._processNext = function() {
  if (this.length > 0) {
    var fn = this.shift();
    if (typeof fn == 'function') {
      fn();
    }
  }
};
Evernote.Semaphore.prototype.toString = function() {
  return this._excessSignals + ":[" + this.join(",") + "]";
};

/*
 * Evernote.Utils
 * Evernote
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Evernote Corp. All rights reserved.
 */
Evernote.Utils = new function Utils() {
};

/**
 * Expands object a with properties of object b
 */
Evernote.Utils.extendObject = function(a, b, deep, overwrite) {
  if (typeof a == 'object' && a != null && typeof b == 'object' && b != null) {
    for ( var i in b) {
      if (typeof a[i] == 'undefined' || overwrite) {
        a[i] = b[i];
      } else if (deep) {
        arguments.callee.apply(this, [ a[i], b[i], deep, overwrite ]);
      }
    }
  }
};
Evernote.Utils.importConstructs = function(fromWindow, toWindow, constructNames) {
  var names = (constructNames instanceof Array) ? constructNames
      : [ constructNames ];
  for ( var i = 0; i < names.length; i++) {
    var nameParts = names[i].split(".");
    var toAnchor = toWindow;
    var fromAnchor = fromWindow;
    for ( var p = 0; p < nameParts.length; p++) {
      if (p == nameParts.length - 1) {
        if (typeof toAnchor[nameParts[p]] == 'undefined') {
          toAnchor[nameParts[p]] = fromAnchor[nameParts[p]];
        } else {
          Evernote.Utils.extendObject(toAnchor[nameParts[p]],
              fromAnchor[nameParts[p]], true);
        }
      } else {
        fromAnchor = fromAnchor[nameParts[p]];
        if (typeof toAnchor[nameParts[p]] == 'undefined') {
          toAnchor[nameParts[p]] = {};
        }
        toAnchor = toAnchor[nameParts[p]];
      }
    }
  }
};

Evernote.Utils.separateString = function(str, separator) {
  if (typeof str != 'string')
    return str;
  if (typeof separator != 'string')
    separator = ",";
  var parts = str.split(separator);
  var returnParts = new Array();
  for ( var i = 0; i < parts.length; i++) {
    if (typeof parts[i] != 'string')
      continue;
    var clean = Evernote.Utils.trim(parts[i]);
    if (clean && clean.length > 0)
      returnParts.push(clean);
  }
  return returnParts;
};

Evernote.Utils.trim = function(str) {
  if (typeof str != 'string')
    return str;
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
};

Evernote.Utils.shortenString = function(str, len, suffix) {
  var s = str + "";
  if (s.length > len) {
    s = s.substring(0, Math.max(0, len
        - ((typeof suffix == 'string') ? suffix.length : 0)));
    if (typeof suffix == 'string')
      s += suffix;
  }
  return s;
};

Evernote.Utils.htmlEntities = function(anything) {
  return $("<div/>").text(anything).html();
};
Evernote.Utils.urlWithoutHash = function(url) {
  return url.replace(/^([^#]+).*$/, "$1");
};
Evernote.Utils.urlPath = function(url) {
  if (typeof url == 'string') {
    var path = url.replace(/^[^:]+:\/+([^\/]+)/, "");
    if (path.indexOf("/") == 0) {
      return path.replace(/^(\/[^\?\#]*).*$/, "$1");
    }
  }
  return "";
};
Evernote.Utils.urlDomain = function(url, includePort) {
  if (typeof url == 'string') {
    var re = new RegExp("^[^:]+:\/+([^\/" + ((includePort) ? "" : ":")
        + "]+).*$");
    return url.replace(re, "$1");
  }
  return url;
};
Evernote.Utils.urlTopDomain = function(url) {
  var topDomain = url;
  if (typeof url == 'string') {
    var topDomain = Evernote.Utils.urlDomain(url);
    if (topDomain.toLowerCase().indexOf("www.") == 0) {
      topDomain = topDomain.substring(4);
    }
  }
  return topDomain;
};
Evernote.Utils.urlPath = function(url) {
  if (typeof url == 'string') {
    var re = new RegExp("^[^:]+:\/\/[^\/]+([^\&\?]*).*$");
    return url.replace(re, "$1");
  }
  return "";
};
Evernote.Utils.urlQueryValue = function(key, url) {
  if (typeof url == 'string' && typeof key == 'string' && url.indexOf("?") >= 0) {
    var queries = url.split(/[\?\#\&]+/).slice(1);
    var k = key.toLowerCase();
    var results = new Array();
    for ( var i = 0; i < queries.length; i++) {
      var kv = queries[i].split("=", 2);
      if (kv[0].toLowerCase() == k) {
        var r = (kv[1]) ? kv[1].replace(/\+/g, " ") : kv[1];
        results.push(decodeURIComponent(r));
      }
    }
    if (results.length > 0) {
      return results[results.length - 1];
    }
  }
  return null;
};
Evernote.Utils.urlProto = function(url) {
  if (typeof url == 'string') {
    var x = -1;
    if ((x = url.indexOf(":/")) > 0) {
      return url.substring(0, x).toLowerCase();
    }
  }
  return null;
};
Evernote.Utils.absoluteUrl = function(url, base) {
	if (url.indexOf("//") == 0) {
		url = base.replace(/^([^:]+):.*$/, "$1") + ":" + url;
	} else if (url.indexOf("/") == 0) {
   		url = base.replace(/^(.*:\/\/[^\/]+).*$/, "$1") + url;
   	} else if (url.match(/^\.+\//)) {
   		url = base.replace(/^(.*:\/\/[^\/]+).*$/, "$1") + "/" + url;
	} else {
   		url = (base.charAt(base.length - 1) == "/") ? base + url : base + "/" + url;
   	}
	return url;
};
Evernote.Utils.urlToSearchQuery = function(url, searchPrefix) {
  // determine protocol
  var proto = Evernote.Utils.urlProto(url);
  if (proto && proto.indexOf("http") == 0) {
    return Evernote.Utils.httpUrlToSearchQuery(url, searchPrefix);
  } else if (proto && proto == "file") {
    return Evernote.Utils.fileUrlToSearchQuery(url, searchPrefix);
  } else if (proto) {
    return Evernote.Utils.anyProtoUrlToSearchQuery(url, searchPrefix);
  } else {
    return Evernote.Utils.anyUrlToSearchQuery(url, searchPrefix);
  }
};
Evernote.Utils.httpUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  // actual FQDN
  var domain = Evernote.Utils.urlDomain((url + "").toLowerCase());
  var allUrls = [ (pfx + "http://" + domain + "*"),
      (pfx + "https://" + domain + "*") ];
  if (domain.match(/[^0-9\.]/)) {
    var secondaryDomain = (domain.indexOf("www.") == 0) ? domain.substring(4)
        : ("www." + domain);
    // query parameters based on actual FQDN
    allUrls = allUrls.concat( [ (pfx + "http://" + secondaryDomain + "*"),
        (pfx + "https://" + secondaryDomain + "*") ]);
  }
  var q = "any: " + allUrls.join(" ");
  return q;
};
Evernote.Utils.fileUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  var q = pfx + "file:*";
  return q;
};
Evernote.Utils.anyProtoUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  var proto = Evernote.Utils.urlProto(url);
  var secProto = proto + "s";
  if (proto.indexOf("s") == (proto.length - 1)) {
    proto = proto.substring(0, (proto.length - 1));
    secProto = proto + "s";
  }
  var domain = Evernote.Utils.urlDomain(url);
  var allUrls = [ (pfx + proto + "://" + domain + "*"),
      (pfx + secProto + "://" + domain + "*") ];
  var q = "any: " + allUrls.join(" ");
  return q;
};
Evernote.Utils.anyUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  var q = pfx + url + "*";
  return q;
};
Evernote.Utils.urlSuffix = "...";
Evernote.Utils.shortUrl = function(url, maxLength) {
  var shortUrl = url;
  if (typeof url == 'string') {
    if (shortUrl.indexOf("file:") == 0) {
      shortUrl = decodeURIComponent(shortUrl.replace(/^file:.*\/([^\/]+)$/,
          "$1"));
      if (typeof maxLength == 'number' && !isNaN(maxLength)
          && shortUrl.length > maxLength) {
        shortUrl = shortUrl.substring(0, maxLength);
        shortUrl += "" + Evernote.Utils.urlSuffix;
      }
    } else {
      shortUrl = shortUrl.replace(/^([a-zA-Z]+:\/+)?([^\/]+).*$/, "$2");
      if (typeof maxLength == 'number' && !isNaN(maxLength)
          && shortUrl.length > maxLength) {
        shortUrl = shortUrl.substring(0, maxLength);
        shortUrl += "" + Evernote.Utils.urlSuffix;
      } else if (url.substring(url.indexOf(shortUrl) + shortUrl.length).length > 2) {
        shortUrl += "/" + Evernote.Utils.urlSuffix;
      }
    }
  }
  return shortUrl;
};
Evernote.Utils.appendSearchQueryToUrl = function(url, params) {
  var _url = url + "";
  _url += (_url.indexOf("?") >= 0) ? "&" : "?";
  if (typeof params == 'string') {
    _url += params;
  } else if (typeof params == 'object' && params) {
    for ( var i in params) {
      _url += encodeURIComponent(i) + "=" + encodeURIComponent(params[i]) + "&";
    }
  }
  if (_url.charAt(_url.length - 1) == "&") {
    _url = _url.substring(0, _url.length - 1);
  }
  return _url;
};
Evernote.Utils.makeAbsoluteClientRect = function(rect, win) {
  if (!win) {
    win = window;
  }
  var _rect = {
    top : rect.top + win.pageYOffset,
    bottom : rect.bottom + win.pageYOffset,
    left : rect.left + win.pageXOffset,
    right : rect.right + win.pageXOffset,
    width : rect.width,
    height : rect.height
  };
  return _rect;
};
Evernote.Utils.getAbsoluteBoundingClientRect = function(element) {
  var el = (element.nodeType == Node.TEXT_NODE) ? element.parentElement
      : element;
  var _rect = el.getBoundingClientRect();
  var win = (element instanceof Range) ? win = element.commonAncestorContainer.ownerDocument.defaultView
      : win = element.ownerDocument.defaultView;
  return Evernote.Utils.makeAbsoluteClientRect(_rect, win);
};
Evernote.Utils.marginalizeBoundingClientRect = function(rect, computedStyle) {
  var _rect = {
    top : rect.top,
    right : rect.right,
    bottom : rect.bottom,
    left : rect.left,
    width : rect.width,
    height : rect.height
  };
  var mt = parseInt(computedStyle.getPropertyValue("margin-top"));
  if (!isNaN(mt)) {
    _rect.top -= mt;
  }
  var mb = parseInt(computedStyle.getPropertyValue("margin-bottom"));
  if (!isNaN(mb)) {
    _rect.bottom += mb;
  }
  var ml = parseInt(computedStyle.getPropertyValue("margin-left"));
  if (!isNaN(ml)) {
    _rect.left -= ml;
  }
  var mr = parseInt(computedStyle.getPropertyValue("margin-right"));
  if (!isNaN(mr)) {
    _rect.right += mr;
  }
  _rect.width = _rect.right - _rect.left;
  _rect.height = _rect.bottom - _rect.top;
  return _rect;
};
Evernote.Utils.demarginalizeBoundingClientRect = function(rect, computedStyle) {
  var _rect = {
    top : rect.top,
    right : rect.right,
    bottom : rect.bottom,
    left : rect.left,
    width : rect.width,
    height : rect.height
  };
  var mt = parseInt(computedStyle.getPropertyValue("margin-top"));
  if (!isNaN(mt)) {
    _rect.top += mt;
  }
  var mb = parseInt(computedStyle.getPropertyValue("margin-bottom"));
  if (!isNaN(mb)) {
    _rect.bottom -= mb;
  }
  var ml = parseInt(computedStyle.getPropertyValue("margin-left"));
  if (!isNaN(ml)) {
    _rect.left += ml;
  }
  var mr = parseInt(computedStyle.getPropertyValue("margin-right"));
  if (!isNaN(mr)) {
    _rect.right -= mr;
  }
  _rect.width = _rect.right - _rect.left;
  _rect.height = _rect.bottom - _rect.top;
  return _rect;
};
Evernote.Utils.depadRect = function(rect, computedStyle) {
  var _rect = {
    top : rect.top,
    right : rect.right,
    bottom : rect.bottom,
    left : rect.left,
    width : rect.width,
    height : rect.height
  };
  var mt = parseInt(computedStyle.getPropertyValue("padding-top"));
  if (!isNaN(mt)) {
    _rect.top += mt;
  }
  var mb = parseInt(computedStyle.getPropertyValue("padding-bottom"));
  if (!isNaN(mb)) {
    _rect.bottom -= mb;
  }
  var ml = parseInt(computedStyle.getPropertyValue("padding-left"));
  if (!isNaN(ml)) {
    _rect.left += ml;
  }
  var mr = parseInt(computedStyle.getPropertyValue("padding-right"));
  if (!isNaN(mr)) {
    _rect.right -= mr;
  }
  _rect.width = _rect.right - _rect.left;
  _rect.height = _rect.bottom - _rect.top;
  return _rect;
};
Evernote.Utils.getElementForNode = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    return node;
  } else if (node.parentElement) {
    return node.parentElement;
  } else {
    return null;
  }
};
Evernote.Utils.addElementClass = function(element, className) {
  if (className && element && element.nodeType == Node.ELEMENT_NODE) {
    var elementClass = element.className;
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      if (parts.indexOf(className) < 0) {
        parts.push(className);
      }
      element.className = parts.join(" ");
    } else {
      element.className = className;
    }
  }
};
Evernote.Utils.removeElementClass = function(element, className) {
  if (className && element && element.nodeType == Node.ELEMENT_NODE) {
    var elementClass = element.className;
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      var i = -1;
      if ((i = parts.indexOf(className)) >= 0) {
        parts.splice(i, 1);
      }
      element.className = parts.join(" ");
    }
  }
};
Evernote.Utils.XML_ESCAPE_CHAR_MAP = {
  "&" : "&amp;",
  "<" : "&lt;",
  ">" : "&gt;",
  "\"" : "&quot;",
  "'" : "&apos;"
};
Evernote.Utils.escapeXML = function(str) {
  var a = str.split("");
  for ( var i = 0; i < a.length; i++) {
    if (Evernote.Utils.XML_ESCAPE_CHAR_MAP[a[i]]) {
      a[i] = Evernote.Utils.XML_ESCAPE_CHAR_MAP[a[i]];
    }
  }
  return a.join("");
};
Evernote.Utils.rectIntersectPoint = function(a, b) {
  var pt = {
    x : NaN,
    y : NaN
  };
  if (a.right > b.left) {
    pt.x = b.left + ((a.right - b.left) / 2);
  } else {
    pt.x = a.left + ((b.right - a.left) / 2);
  }
  if (a.bottom > b.top) {
    pt.y = b.top + ((a.bottom - b.top) / 2);
  } else {
    pt.y = a.top + ((b.bottom - a.top) / 2);
  }
  if (!isNaN(pt.x) && !isNaN(pt.y)
      && (pt.x > a.left && pt.x < a.right && pt.y > a.top && pt.y < a.bottom)
      || (pt.x > b.left && pt.x < b.right && pt.y > b.top && pt.y < b.bottom)) {
    return pt;
  }
  return undefined;
};
Evernote.Utils.rectIntersection = function(a, b) {
  if (!(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top)) {
    var aRect = {
      left : Math.max(a.left, b.left),
      top : Math.max(a.top, b.top),
      right : Math.min(a.right, b.right),
      bottom : Math.min(a.bottom, b.bottom)
    };
    aRect.width = aRect.right - aRect.left;
    aRect.height = aRect.bottom - aRect.top;
    return aRect;
  }
  return undefined;
};
Evernote.Utils.rectsEqual = function(a, b) {
  if (a.left == b.left && a.right == b.right && a.top == b.top
      && a.bottom == b.bottom) {
    return true;
  } else {
    return false;
  }
};
Evernote.Utils.expandRect = function(a, b) {
  a.left = (a.left) ? Math.min(a.left, b.left) : b.left;
  a.top = (a.top) ? Math.min(a.top, b.top) : b.top;
  a.right = (a.right) ? Math.max(a.right, b.right) : b.right;
  a.bottom = (a.bottom) ? Math.max(a.bottom, b.bottom) : b.bottom;
};
Evernote.Utils.errorDescription = function(err) {
    var msg = null;
    if (err instanceof FileError) {
        var errName = null;
        var errCode = err.code;
        if (typeof errCode == 'number') {
            for (var prop in FileError) {
                if (prop.toLowerCase().indexOf("_err") > 0 && FileError[prop] == err.code) {
                    msg = "FileError: " + errCode + " ("+prop+")";
                    break;
                }
            }
        } else {
            msg = "FileError: " + errCode;
        }
    } else if (err.message) {
        msg = err.message;
    } else if (typeof err.code != 'undefined') {
        var constructorName = (err.constructor && err.constructor.name) ? err.constructor.name : (""+err);
        msg = constructorName + " code: " + err.code;
    }
    return msg;
};


/*
 * Constants
 * Evernote
 * 
 * Created by Pavel Skaldin on 3/1/10
 * Copyright 2010 Evernote Corp. All rights reserved.
 */
Evernote.Constants = Evernote.Constants || {};

/**
 * Lists typeof of requests the extension makes. Lower codes (below 100) are
 * strictly for basic functionality of the extension. Higher codes are for
 * particular applications of the extension - such as content clipping,
 * simSearch etc. It is customary for higher codes to utilize odd numbers for
 * error codes and even numbers otherwise.
 */

Evernote.Constants.RequestType = {
  UNKNOWN : 0,
  // used to signal logout
  LOGOUT : 1,
  // used to signal login
  LOGIN : 2,
  // used to signal authentication error
  AUTH_ERROR : 3,
  // used to signal successful authentication
  AUTH_SUCCESS : 4,
  // used to signal false result of checkVersion call
  CHECK_VERSION_FALSE : 5,
  // used to signal when the client was updated with user-data
  DATA_UPDATED : 6,
  // used to signal that user has reached his quota
  QUOTA_REACHED : 7,
  // used to signal background process that popup has started
  POPUP_STARTED : 8,
  // used to signal that popup's existence has ended (i.e. it was inadvertently
  // dismissed)
  POPUP_ENDED : 9,
  // used to indicate that there was a problem allocating clipProcessor
  CLIP_PROCESSOR_INIT_ERROR : 11,
  // used to request failed payloads from clipProcessor
  GET_MANAGED_PAYLOAD : 14,
  // used to request a re-trial of a failed payload
  RETRY_MANAGED_PAYLOAD : 15,
  // used to request cancellation of a failed payload
  CANCEL_MANAGED_PAYLOAD : 16,
  // used to request reivisting of failed payload
  REVISIT_MANAGED_PAYLOAD : 17,
  // used to request viewing of processed payload's clip
  VIEW_MANAGED_PAYLOAD_DATA : 18,
  // used to request editing of processed payload's clip
  EDIT_MANAGED_PAYLOAD_DATA : 19,
  // used to signal when the client receives new data from the server
  SYNC_DATA : 20,
  // used to signal client's failure to process data during sync
  SYNC_DATA_FAILURE : 21,
  // used to signal upon removal of log files
  LOG_FILE_REMOVED : 30,
  // used to signal swapping of log file
  LOG_FILE_SWAPPED : 32,
  // indicates that a clip was made from a page
  PAGE_CLIP_SUCCESS : 100,
  // indicates that a clip failed to be created from a page
  PAGE_CLIP_FAILURE : 101,
  // indicates that a clip with content was made from a page
  PAGE_CLIP_CONTENT_SUCCESS : 102,
  // indicates that a clip with content failed to be created from a page
  PAGE_CLIP_CONTENT_FAILURE : 103,
  // indicates that a clip is too big in size
  PAGE_CLIP_CONTENT_TOO_BIG : 105,
  // indicates that clip was synchronized with the server
  CLIP_SUCCESS : 110,
  // indicates that clip failed to synchronize with the server
  CLIP_FAILURE : 111,
  // indicates that there was an HTTP transport error while syncing page clip
  // to the server
  CLIP_HTTP_FAILURE : 113,
  // indicates that clip was filed on the server
  CLIP_FILE_SUCCESS : 120,
  // indicates that clip failed to fil on the server
  CLIP_FILE_FAILURE : 121,
  // indicates that there was an HTTP transport error while filing a note on the
  // server
  CLIP_FILE_HTTP_FAILURE : 123,
  // used to signal listener to cancel a timer that's waiting on page clip
  CANCEL_PAGE_CLIP_TIMER : 200,
  AUTOSAVE : 212,
  // used to signal that options have been updated
  OPTIONS_UPDATED : 320,
  // used to signal that search-helper needs to be disabled
  SEARCH_HELPER_DISABLE : 340,
  // used to signal that a timeout waiting for the content script to be loaded
  // needs to be cancelled
  CONTENT_SCRIPT_LOAD_TIMEOUT_CANCEL : 400,
  // used to signal that content script loading timed out
  CONTENT_SCRIPT_LOAD_TIMEOUT : 401,
  // indicates that a clip was made from a page
  CONTEXT_PAGE_CLIP_SUCCESS : 2100,
  // indicates that a clip failed to be created from a page
  CONTEXT_PAGE_CLIP_FAILURE : 2101,
  // indicates that a clip with content was made from a page
  CONTEXT_PAGE_CLIP_CONTENT_SUCCESS : 2102,
  // indicates that a clip with content failed to be created from a page
  CONTEXT_PAGE_CLIP_CONTENT_FAILURE : 2103,
  // indicates that a clip is too big in size
  CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG : 2105,
  // used to ask background process to fetch external style sheets and return
  // parsed cssText
  FETCH_STYLE_SHEET_RULES : 3001,
  // indicates user-preference for clipping full page
  CLIP_ACTION_FULL_PAGE : 4001,
  // indicates user-preference for clipping article portion of the page
  CLIP_ACTION_ARTICLE : 4002,
  // indicates user-preference for clipping user-selected portion of the page
  CLIP_ACTION_SELECTION : 4003,
  // indicates user-preference for clipping just the URL to the page
  CLIP_ACTION_URL : 4004,
  // used to clear clip preview
  PREVIEW_CLIP_ACTION_CLEAR : 4010,
  // indicates user-preference for previewing full page
  PREVIEW_CLIP_ACTION_FULL_PAGE : 4011,
  // indicates user-preference for previewing article portion of the page
  PREVIEW_CLIP_ACTION_ARTICLE : 4012,
  // indicates user-preference for previewing user-selected portion of the page
  PREVIEW_CLIP_ACTION_SELECTION : 4013,
  // indicates user-preference for previewing just the URL to the page
  PREVIEW_CLIP_ACTION_URL : 4014,
  // used to notify with PageInfo object
  PAGE_INFO : 5000,
  // used to nudge preview in some direction
  PREVIEW_NUDGE: 6010,
  // used to notify nudge preview to previous sibling
  PREVIEW_NUDGE_PREVIOUS_SIBLING: 6011,
  // used to notify nudge preview to next sibling
  PREVIEW_NUDGE_NEXT_SIBLING: 6012,
  // used to notify nudge preview to the parent of current root element
  PREVIEW_NUDGE_PARENT: 6013,
  // used to notify nudge preview to the next sibling of the parent of the current root element
  PREVIEW_NUDGE_CHILD: 6014
};

Evernote.Constants.Limits = {
  EDAM_USER_USERNAME_LEN_MIN : 1,
  EDAM_USER_USERNAME_LEN_MAX : 64,
  EDAM_USER_USERNAME_REGEX : "^[a-z0-9]([a-z0-9_-]{0,62}[a-z0-9])?$",
  
  EDAM_EMAIL_LEN_MIN : 6,
  EDAM_EMAIL_LEN_MAX : 255,
  EDAM_EMAIL_REGEX : "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.([A-Za-z]{2,})$",

  EDAM_USER_PASSWORD_LEN_MIN : 6,
  EDAM_USER_PASSWORD_LEN_MAX : 64,
  EDAM_USER_PASSWORD_REGEX : "^[A-Za-z0-9!#$%&'()*+,./:;<=>?@^_`{|}~\\[\\]\\\\-]{6,64}$",

  EDAM_NOTE_TITLE_LEN_MIN : 0,
  EDAM_NOTE_TITLE_LEN_MAX : 255,
  EDAM_NOTE_TITLE_REGEX : "^$|^[^\\s\\r\\n\\t]([^\\n\\r\\t]{0,253}[^\\s\\r\\n\\t])?$",

  EDAM_TAG_NAME_LEN_MIN : 1,
  EDAM_TAG_NAME_LEN_MAX : 100,
  EDAM_TAG_NAME_REGEX : "^[^,\\s\\r\\n\\t]([^,\\n\\r\\t]{0,98}[^,\\s\\r\\n\\t])?$",

  EDAM_NOTE_TAGS_MIN : 0,
  EDAM_NOTE_TAGS_MAX : 100,

  SERVICE_DOMAIN_LEN_MIN : 1,
  SERVICE_DOMAIN_LEN_MAX : 256,

  CLIP_NOTE_CONTENT_LEN_MAX : 5242880,

  EDAM_USER_RECENT_MAILED_ADDRESSES_MAX : 10,
  EDAM_EMAIL_LEN_MIN : 6,
  EDAM_EMAIL_LEN_MAX : 255,
  EDAM_EMAIL_REGEX : "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.([A-Za-z]{2,})$"
};

/**
 * Chrome specific logger implementation to be used with Chrome extensions
 * 
 * @author pasha
 */
Evernote.ChromeExtensionLoggerImpl = function ChromeExtensionLoggerImpl(logger) {
  this.initialize(logger);
};
Evernote.inherit(Evernote.ChromeExtensionLoggerImpl, Evernote.WebKitLoggerImpl,
    true);

Evernote.ChromeExtensionLoggerImpl.isResponsibleFor = function(navigator) {
  return (navigator.userAgent.toLowerCase().indexOf("chrome/") > 0);
};

Evernote.ChromeExtensionLoggerImpl.prototype._enabled = true;

Evernote.Utils = Evernote.Utils || new function Utils() {
};

Evernote.Utils.MESSAGE_ATTR = "message";
Evernote.Utils.PLACEHOLDER_ATTR = "placeholder";
Evernote.Utils.TITLE_ATTR = "title";
Evernote.Utils.MESSAGE_DATA_ATTR = "messagedata";
Evernote.Utils.LOCALIZED_ATTR = "localized";
Evernote.Utils.BADGE_NORMAL_COLOR = [ 255, 0, 0, 255 ];
Evernote.Utils.BADGE_UPLOADING_COLOR = [ 255, 255, 0, 255 ];

Evernote.Utils.updateBadge = function(context, tabId) {
  var LOG = Evernote.chromeExtension.logger;
  LOG.debug("Utils.updateBadge");
  var sh = null;
  if (context) {
    if (context.clipProcessor.length > 0) {
      Evernote.Utils.setBadgeBackgroundColor(
          Evernote.Utils.BADGE_UPLOADING_COLOR, tabId);
      LOG.debug("Badge indicates pending notes: "
          + context.clipProcessor.length);
      Evernote.Utils.setBadgeText(context.clipProcessor.length, tabId);
      Evernote.Utils.setBadgeTitle(chrome.i18n
          .getMessage("BrowserActionTitlePending"), tabId);
    } else if (typeof tabId == 'number'
        && chrome.extension
        && typeof chrome.extension.getBackgroundPage().Evernote.SearchHelper != 'undefined'
        && (sh = chrome.extension.getBackgroundPage().Evernote.SearchHelper
            .getInstance(tabId)) && sh && sh.hasResults()) {
      Evernote.Utils.setBadgeBackgroundColor(Evernote.Utils.BADGE_NORMAL_COLOR,
          tabId);
      LOG.debug("Badge indicates simsearch results: " + sh.result.totalNotes);
      Evernote.Utils.setBadgeText(sh.result.totalNotes, tabId);
      Evernote.Utils.setBadgeTitle(
          chrome.i18n.getMessage("BrowserActionTitle"), tabId);
    } else {
      LOG.debug("Clearing badge for there's nothing interesting to show");
      Evernote.Utils.clearBadge(tabId);
      Evernote.Utils.setBadgeTitle(
          chrome.i18n.getMessage("BrowserActionTitle"), tabId);
    }
  }
};

Evernote.Utils.clearBadge = function(tabId) {
  var o = {
    text : ""
  };
  if (typeof tabId == 'number') {
    o["tabId"] = tabId;
    chrome.browserAction.setBadgeText(o);
  } else {
    this.clearAllBadges();
  }
};

Evernote.Utils.clearAllBadges = function() {
  this.doInEveryNormalTab(function(tab) {
    chrome.browserAction.setBadgeText( {
      tabId : tab.id,
      text : ""
    });
  }, true);
};

Evernote.Utils.setBadgeBackgroundColor = function(color, tabId) {
  var o = {
    color : color
  };
  if (typeof tabId == 'number') {
    o["tabId"] = tabId;
    chrome.browserAction.setBadgeBackgroundColor(o);
  } else {
    this.doInEveryNormalTab(function(tab) {
      o.tabId = tab.id;
      chrome.browserAction.setBadgeBackgroundColor(o);
    }, true);
  }
};

Evernote.Utils.setBadgeText = function(txt, tabId) {
  if (txt) {
    var o = {
      text : "" + txt
    };
    if (typeof tabId == 'number') {
      o["tabId"] = tabId;
      chrome.browserAction.setBadgeText(o);
    } else {
      this.doInEveryNormalTab(function(tab) {
        o.tabId = tab.id;
        chrome.browserAction.setBadgeText(o);
      }, true);
    }
  } else if (txt == null) {
    Evernote.Utils.clearBadge(tabId);
  }
};

Evernote.Utils.setBadgeTitle = function(title, tabId) {
  if (title) {
    var o = {
      title : "" + title
    };
    if (typeof tabId == 'number') {
      o["tabId"] = tabId;
      chrome.browserAction.setTitle(o);
    } else {
      this.doInEveryNormalTab(function(tab) {
        o.tabId = tab.id;
        chrome.browserAction.setTitle(o);
      }, true);
    }
  } else if (title == null) {
    Evernote.Utils.clearBadgeTitle(tabId);
  }
};

Evernote.Utils.clearBadgeTitle = function(tabId) {
  var o = {
    title : ""
  };
  if (typeof tabId == 'number') {
    o["tabId"] = tabId;
    chrome.browserAction.setTitle(o);
  } else {
    this.doInEveryNormalTab(function(tab) {
      o.tabId = tab.id;
      chrome.browserAction.setTitle(o);
    }, true);
  }
};

Evernote.Utils.doInEveryNormalTab = function(callback, onlySelected) {
  chrome.windows.getAll( {
    populate : true
  }, function(wins) {
    for ( var w = 0; w < wins.length; w++) {
      if (wins[w].type == "normal") {
        for ( var t = 0; t < wins[w].tabs.length; t++) {
          if (!onlySelected || wins[w].tabs[t].selected) {
            callback(wins[w].tabs[t], wins[w]);
          }
        }
      }
    }
  });
};

Evernote.Utils.localizeBlock = function(block) {
  if (block.attr(Evernote.Utils.MESSAGE_ATTR))
    Evernote.Utils.localizeElement(block);
  var siblings = block.find("[" + Evernote.Utils.MESSAGE_ATTR + "], ["
      + Evernote.Utils.PLACEHOLDER_ATTR + "], [" + Evernote.Utils.TITLE_ATTR
      + "]");
  for ( var i = 0; i < siblings.length; i++) {
    var sibling = $(siblings.get(i));
    Evernote.Utils.localizeElement(sibling);
  }
};

Evernote.Utils.extractLocalizationField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Evernote.Utils.MESSAGE_ATTR))
    return element.attr(Evernote.Utils.MESSAGE_ATTR);
  else
    return null;
};
Evernote.Utils.extractLocalizationDataField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Evernote.Utils.MESSAGE_DATA_ATTR)) {
    var v = element.attr(Evernote.Utils.MESSAGE_DATA_ATTR);
    try {
      v = eval(v);
    } catch (e) {
    }
    if (!(v instanceof Array))
      v = [ v ];
    return v;
  } else {
    return null;
  }
};
Evernote.Utils.extractLocalizationPlaceholderField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Evernote.Utils.PLACEHOLDER_ATTR)) {
    return element.attr(Evernote.Utils.PLACEHOLDER_ATTR);
  } else {
    return null;
  }
};
Evernote.Utils.extractLocalizationTitleField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Evernote.Utils.TITLE_ATTR)) {
    return element.attr(Evernote.Utils.TITLE_ATTR);
  } else {
    return null;
  }
};

Evernote.Utils.localizeElement = function(element, force) {
  if (!force && element.attr(Evernote.Utils.LOCALIZED_ATTR)
      && element.attr(Evernote.Utils.LOCALIZED_ATTR == "true")) {
    return;
  }
  var field = Evernote.Utils.extractLocalizationField(element);
  var placeholderField = Evernote.Utils
      .extractLocalizationPlaceholderField(element);
  var titleField = Evernote.Utils.extractLocalizationTitleField(element);
  var fieldData = Evernote.Utils.extractLocalizationDataField(element);
  var localized = false;
  if (field) {
    if (fieldData) {
      var msg = chrome.i18n.getMessage(field, fieldData);
    } else {
      var msg = chrome.i18n.getMessage(field);
    }
    if (element.attr("tagName") == "INPUT") {
      element.val(msg);
    } else {
      element.html(msg);
    }
    localized = true;
  }
  if (placeholderField) {
    var msg = chrome.i18n.getMessage(placeholderField);
    element.attr(Evernote.Utils.PLACEHOLDER_ATTR, msg);
    localized = true;
  }
  if (titleField) {
    var msg = chrome.i18n.getMessage(titleField);
    element.attr(Evernote.Utils.TITLE_ATTR, msg);
    localized = true;
  }
  if (localized) {
    element.attr(Evernote.Utils.LOCALIZED_ATTR, "true");
  }
};

Evernote.Utils.notifyExtension = function(requestMessage, callback) {
  chrome.windows.getCurrent(function(win) {
    chrome.tabs.getSelected(win.id, function(tab) {
      var o = {
        tab : tab,
        id : chrome.i18n.getMessage("@@extension_id")
      };
      var cb = callback || function() {
      };
      chrome.extension.onRequest.dispatch(requestMessage, o, cb);
      chrome.extension.sendRequest(requestMessage, cb);
    });
  });
};

Evernote.Utils._setDesktopNotificationAttributes = function(notification, attrs) {
  if (notification && typeof attrs == 'object' && attrs) {
    for ( var i in attrs) {
      notification[i] = attrs[i];
    }
  }
};
Evernote.Utils.notifyDesktop = function(title, message, timeout, attrs) {
  var notification = webkitNotifications.createNotification(
      'images/en_app_icon-48.png', title, message);
  this._setDesktopNotificationAttributes(notification, attrs);
  notification.show();
  if (typeof timeout == 'number') {
    setTimeout(function() {
      notification.cancel();
    }, timeout);
  }
  return notification;
};
Evernote.Utils.notifyDesktopWithHTML = function(filePath, timeout, attrs) {
  var notification = webkitNotifications.createHTMLNotification(filePath);
  this._setDesktopNotificationAttributes(notification, attrs);
  notification.show();
  if (typeof timeout == 'number') {
    setTimeout(function() {
      notification.cancel();
    }, timeout);
  }
  return notification;
};
Evernote.Utils.openWindow = function(url) {
  var bg = chrome.extension.getBackgroundPage();
  bg.Evernote.chromeExtension.openWindow(url);
};
Evernote.Utils.openNoteWindow = function(noteUrl) {
  var bg = chrome.extension.getBackgroundPage();
  bg.Evernote.chromeExtension.openNoteWindow(noteUrl);
};
Evernote.Utils.getPostData = function(queryString) {
  if (typeof queryString == 'undefined') {
    queryString = window.location.search.replace(/^\?/, "");
  }
  var result = {};
  if (queryString) {
    var parts = queryString.split("&");
    for ( var i = 0; i < parts.length; i++) {
      var kv = parts[i].split("=");
      var k = unescape(kv[0]);
      var v = (kv[1]) ? unescape(kv[1]) : null;
      if (v) {
        try {
          result[k] = JSON.parse(v);
        } catch (e) {
          result[k] = v;
        }
      } else {
        result[k] = v;
      }
    }
  }
  return result;
};
Evernote.Utils.getLocalizedMessage = function(messageKey, params) {
  if (typeof chrome != 'undefined'
      && typeof chrome.i18n.getMessage == 'function') {
    return chrome.i18n.getMessage(messageKey, params);
  } else {
    return messageKey;
  }
};
Evernote.Utils.extractHttpErrorMessage = function(xhr, textStatus, error) {
  if (this.quiet)
    return;
  if (xhr && xhr.readyState == 4) {
    var msg = this.getLocalizedMessage("Error_HTTP_Transport", [
        ("" + xhr.status), ((typeof error == 'string') ? error : "") ]);
  } else {
    var msg = this.getLocalizedMessage("Error_HTTP_Transport", [
        ("readyState: " + xhr.readyState), "" ]);
  }
  return msg;
};
Evernote.Utils.extractErrorMessage = function(e, defaultMessage) {
  var msg = (typeof defaultMessage != 'undefined') ? defaultMessage : null;
  if (e instanceof Evernote.EvernoteError
      && typeof e.errorCode == 'number'
      && typeof e.parameter == 'string'
      && this.getLocalizedMessage("EDAMError_" + e.errorCode + "_"
          + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"))) {
    msg = this.getLocalizedMessage("EDAMError_" + e.errorCode + "_"
        + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"));
  } else if (e instanceof Evernote.EDAMResponseException
      && typeof e.errorCode == 'number'
      && this.getLocalizedMessage("EDAMResponseError_" + e.errorCode)) {
    if (typeof e.parameter == 'string') {
      msg = this.getLocalizedMessage("EDAMResponseError_" + e.errorCode,
          e.parameter);
    } else {
      msg = this.getLocalizedMessage("EDAMResponseError_" + e.errorCode);
    }
  } else if (e instanceof Evernote.EvernoteError
      && typeof e.errorCode == 'number'
      && this.getLocalizedMessage("EDAMError_" + e.errorCode)) {
    if (typeof e.parameter == 'string') {
      msg = this.getLocalizedMessage("EDAMError_" + e.errorCode, e.parameter);
    } else {
      msg = this.getLocalizedMessage("EDAMError_" + e.errorCode);
    }
  } else if (e instanceof Evernote.EvernoteError
      && typeof e.message == 'string') {
    msg = e.message;
  } else if ((e instanceof Error || e instanceof Error)
      && typeof e.message == 'string') {
    msg = e.message;
  } else if (typeof e == 'string') {
    msg = e;
  }
  return msg;
};

Evernote.Utils.isForbiddenUrl = function(url) {
  if (typeof url == 'string'
      && (url.toLowerCase().indexOf("chrome.google.com/extensions") >= 0 || url
          .toLowerCase().indexOf("chrome.google.com/webstore") >= 0)) {
    return true;
  }
  if (typeof url == 'string' && !url.toLowerCase().match(/^https?:\/\//)) {
    return true;
  }
  return false;
};

Evernote.Utils.getTextSize = function(text) {
  var el = $("<div></div>");
  el.text(text);
  el.css( {
    position : "absolute",
    top : "0px",
    left : "0px",
    padding : "0px",
    margin : "0px",
    display : "block",
    zIndex : "0",
    color : "rgba(0, 0, 0, 0)",
    background : "rgba(0, 0, 0, 0)"
  });
  $("body").append(el);
  var size = {
    width : el.width(),
    height : el.height()
  };
  el.remove();
  return size;
};

Evernote.Utils.updateSelectElementWidth = function(el, textCallback) {
  var $el = (el instanceof jQuery) ? el : $(el);
  var val = $el.val();
  if (typeof textCallback == 'function') {
    val = textCallback(val);
  }
  var ld = parseInt($el.css("paddingLeft"));
  var rd = parseInt($el.css("paddingRight"));
  var delta = ((!isNaN(ld)) ? ld : 0) + ((!isNaN(rd)) ? rd : 0);
  var w = Evernote.Utils.getTextSize(val).width;
  w = (w) ? w : 0;
  var newWidth = w + delta;
  // adjust by another 10 pixels - mainly for Windows platform
  newWidth += 10;
  $el.css( {
    minWidth : newWidth + "px",
    width : newWidth + "px"
  });
};

Evernote.Utils.resizeElement = function(el, size, handler) {
  var $el = (el instanceof jQuery) ? el : $(el);
  var cssObj = {};
  var sizeObj = {};
  if (size && typeof size.width == 'number') {
    var ld = parseInt($el.css("paddingLeft"));
    var rd = parseInt($el.css("paddingRight"));
    var delta = ((!isNaN(ld)) ? ld : 0) + ((!isNaN(rd)) ? rd : 0);
    sizeObj.width = (size.width + delta);
    cssObj.minWidth = sizeObj.width + "px";
    cssObj.width = sizeObj.width + "px";
  }
  if (size && typeof size.height == 'number') {
    var td = parseInt($el.css("paddingTop"));
    var bd = parseInt($el.css("paddingBottom"));
    var delta = ((!isNaN(td)) ? td : 0) + ((!isNaN(bd)) ? bd : 0);
    sizeObj.height = size.height + delta;
    cssObj.minHeight = sizeObj.height + "px";
    css.height = sizeObj.height + "px";
  }
  $el.css(cssObj);
  if (typeof handler == 'function') {
    handler($el, sizeObj);
  }
};

Evernote.Utils.BAD_FAV_ICON_URLS = [ "http://localhost/favicon.ico" ];
Evernote.Utils.createUrlClipContent = function(title, url, favIcoUrl) {
  var titleAttr = (title) ? Evernote.Utils.escapeXML(title) : "";
  var style = "font-size: 12pt; line-height: 18px; display: inline;";
  var content = "<a title=\"" + titleAttr + "\" style=\"" + style
      + "\" href=\"" + url + "\">" + url + "</a>";
  if (typeof favIcoUrl == 'string' && favIcoUrl.length > 0
      && Evernote.Utils.BAD_FAV_ICON_URLS.indexOf(favIcoUrl.toLowerCase()) < 0) {
    var imgStyle = "display:inline;border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;";
    content = "<span><img title=\"" + titleAttr + "\" style=\"" + imgStyle
        + "\" src=\"" + favIcoUrl + "\"/>" + content + "</span>"
  } else {
    content = "<span>" + content + "</span>";
  }
  return content;
};

Evernote.Utils.getView = function(url) {
    var views = chrome.extension.getViews();
    for ( var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.window.location.href) {
            if (typeof url == 'string' && view.window.location.href.indexOf(url) > 0) {
                return view;
            } else if (url && url instanceof RegExp && url.match(url)) {
                return view;
            }
        }
    }
    return null;
};

(function() {
  var LOG = null;
  Evernote.SearchHelperContentScript = function SearchHelperContentScript() {
    LOG = Evernote.Logger.getInstance();
    this.injectStyleSheets( [ "chrome-extension://"
        + chrome.i18n.getMessage("@@extension_id") + "/css/searchhelper.css" ]);
  };
  Evernote.SearchHelperContentScript._instance = null;
  Evernote.SearchHelperContentScript.getInstance = function() {
    if (!this._instance) {
      this._instance = new Evernote.SearchHelperContentScript();
    }
    return this._instance;
  };
  Evernote.SearchHelperContentScript.prototype.EVERNOTE_RESULT_STATS_ID = "evernoteResultStats";
  Evernote.SearchHelperContentScript.prototype.EVERNOTE_RESULT_STATS_MESSAGE_ID = "evernoteResultStatsMessage";
  Evernote.SearchHelperContentScript.prototype.EVERNOTE_RESULT_STATS_ERROR_MESSAGE_ID = "evernoteResultStatsErrorMessage";
  Evernote.SearchHelperContentScript.prototype.EVERNOTE_RESULT_STATS_FOOTER_ID = "evernoteResultStatsFooter";

  Evernote.SearchHelperContentScript.prototype.injectStyleSheets = function(
      urls, force) {
    var links = document.head.getElementsByTagName("link");
    if (links) {
      links = Array.prototype.slice.call(links);
    }
    var linkMap = {};
    while (links && links.length > 0) {
      var u = null;
      var link = links.shift();
      if (link.getAttribute("rel") == "stylesheet"
          && link.getAttribute("type") == "text/css"
          && (u = link.getAttribute("href"))) {
        linkMap[u] = link;
      }
    }
    for ( var i = 0; i < urls.length; i++) {
      var url = urls[i];
      if (!force && linkMap[url]) {
        continue;
      }
      var style = document.createElement("link");
      style.setAttribute("rel", "stylesheet");
      style.setAttribute("type", "text/css");
      style.setAttribute("href", url);
      document.head.appendChild(style);
    }
  };

  Evernote.SearchHelperContentScript.prototype.getElement = function(el) {
    var id = el.getAttribute("id");
    if (id) {
      return this.getMessageBlock(id);
    }
    return null;
  };

  Evernote.SearchHelperContentScript.prototype.appendReplaceElement = function(
      element, parent) {
    LOG.debug("SearchHelperContentScript.appendReplaceElement");
    var old = this.getElement(element);
    if (old) {
      old.parentNode.replaceChild(element, old);
    } else {
      parent.appendChild(element);
    }
  };

  Evernote.SearchHelperContentScript.prototype.prependMessageBlock = function(
      element, message, footer, creatorFn) {
    LOG.debug("SearchHelperContentScript.prependMessageBlock");
    var el = this.findTargetElement(element);
    if (el) {
      var stats = this.getResultStats();
      if (!stats) {
        stats = this.createResultStats(message);
        el.parentNode.insertBefore(stats, el);
      }
      if (message) {
        this.appendReplaceElement(creatorFn.apply(this, [ message ]), stats);
      }
      if (footer) {
        this.appendReplaceElement(this.createMessageFooter(footer), stats);
      }
    }
    this.bindMessageElements();
  };

  Evernote.SearchHelperContentScript.prototype.appendMessageBlock = function(
      element, message, footer, creatorFn) {
    LOG.debug("SearchHelperContentScript.appendMessageBlock");
    var el = this.findTargetElement(element);
    if (el) {
      var stats = this.getResultStats();
      if (!stats) {
        stats = this.createResultStats(message);
        el.parentNode.appendChild(stats);
      }
      var stats = this.createResultStats();
      if (message) {
        this.appendReplaceElement(creatorFn.apply(this, [ message ]), stats);
      }
      if (footer) {
        this.appendReplaceElement(this.createMessageFooter(footer), stats);
      }
    }
    this.bindMessageElements();
  };

  Evernote.SearchHelperContentScript.prototype.prependMessage = function(
      element, message, footer) {
    LOG.debug("SearchHelperContentScript.prependMessage");
    this.prependMessageBlock(element, message, footer, this.createMessage);
  };

  Evernote.SearchHelperContentScript.prototype.appendMessage = function(
      element, message, footer) {
    LOG.debug("SearchHelperContentScript.appendMessage");
    this.appendMessageBlock(element, message, footer, this.createMessage);
  };

  Evernote.SearchHelperContentScript.prototype.prependErrorMessage = function(
      element, message, footer) {
    LOG.debug("SearchHelperContentScript.prependErrorMessage");
    this.prependMessageBlock(element, message, footer, this.createErrorMessage);
  };

  Evernote.SearchHelperContentScript.prototype.appendErrorMessage = function(
      element, message, footer) {
    LOG.debug("SearchHelperContentScript.appendErrorMessage");
    this.appendMessageBlock(element, message, footer, this.createErrorMessage);
  };

  Evernote.SearchHelperContentScript.prototype.createResultStats = function() {
    LOG.debug("SearchHelperContentScript.createResultStats");
    var el = document.createElement("DIV");
    el.setAttribute("id", this.EVERNOTE_RESULT_STATS_ID);
    var domainClassName = this.domainAsClassName();
    if (domainClassName) {
      el.setAttribute("class", domainClassName);
    }
    return el;
  };

  Evernote.SearchHelperContentScript.prototype.removeResultStats = function() {
    LOG.debug("SearchHelperContentScript.removeResultStats");
    var el = this.getResultStats();
    if (el) {
      el.parentNode.removeChild(el);
    }
  };

  Evernote.SearchHelperContentScript.prototype.getResultStats = function() {
    return document.getElementById(this.EVERNOTE_RESULT_STATS_ID);
  };

  Evernote.SearchHelperContentScript.prototype.createMessageBlock = function(
      message, attrs) {
    LOG.debug("SearchHelperContentScript.createMessageBlock");
    var el = document.createElement("DIV");
    if (typeof attrs == 'object' && attrs != null) {
      for ( var attrName in attrs) {
        el.setAttribute(attrName, attrs[attrName]);
      }
    }
    if (message) {
      el.innerHTML = message;
    }
    return el;
  };

  Evernote.SearchHelperContentScript.prototype.removeMessageBlock = function(id) {
    LOG.debug("SearchHelperContentScript.removeMessageBlock");
    var el = this.getMessageBlock(id);
    if (el) {
      el.parentNode.removeChild(el);
    }
  };

  Evernote.SearchHelperContentScript.prototype.getMessageBlock = function(id) {
    LOG.debug("SearchHelperContentScript.getMessageBlock " + id);
    return document.getElementById(id);
  };

  Evernote.SearchHelperContentScript.prototype.createMessage = function(message) {
    LOG.debug("SearchHelperContentScript.createMessage");
    return this.createMessageBlock(message, {
      id : this.EVERNOTE_RESULT_STATS_MESSAGE_ID
    });
  };

  Evernote.SearchHelperContentScript.prototype.removeMessage = function() {
    LOG.debug("SearchHelperContentScript.removeMessage");
    this.removeMessageBlock(this.EVERNOTE_RESULT_STATS_MESSAGE_ID);
  };

  Evernote.SearchHelperContentScript.prototype.getMessage = function() {
    LOG.debug("SearchHelperContentScript.getMessage");
    return this.getMessageBlock(this.EVERNOTE_RESULT_STATS_MESSAGE_ID);
  };

  Evernote.SearchHelperContentScript.prototype.createErrorMessage = function(
      message) {
    LOG.debug("SearchHelperContentScript.createErrorMessage");
    return this.createMessageBlock(message, {
      id : this.EVERNOTE_RESULT_STATS_ERROR_MESSAGE_ID
    });
  };

  Evernote.SearchHelperContentScript.prototype.removeErrorMessage = function() {
    LOG.debug("SearchHelperContentScript.removeErrorMessage");
    this.removeMessageBlock(this.EVERNOTE_RESULT_STATS_ERROR_MESSAGE_ID);
  };

  Evernote.SearchHelperContentScript.prototype.getErrorMessage = function() {
    LOG.debug("SearchHelperContentScript.getErrorMessage");
    return this.getMessageBlock(this.EVERNOTE_RESULT_STATS_ERROR_MESSAGE_ID);
  };

  Evernote.SearchHelperContentScript.prototype.createMessageFooter = function(
      message) {
    LOG.debug("SearchHelperContentScript.createMessageFooter");
    return this.createMessageBlock(message, {
      id : this.EVERNOTE_RESULT_STATS_FOOTER_ID
    });
  };

  Evernote.SearchHelperContentScript.prototype.removeMessageFooter = function() {
    LOG.debug("SearchHelperContentScript.removeMessageFooter");
    this.removeMessageBlock(this.EVERNOTE_RESULT_STATS_FOOTER_ID);
  };

  Evernote.SearchHelperContentScript.prototype.getMessageFooter = function() {
    LOG.debug("SearchHelperContentScript.getMessageFooter");
    return this.getMessageBlock(this.EVERNOTE_RESULT_STATS_FOOTER_ID);
  };

  Evernote.SearchHelperContentScript.prototype.findParentSimpleSelector = function(
      e, sel) {
    LOG.debug("SearchHelperContentScript.findParentSimpleSelector: " + sel);
    var parent = e;
    while (parent && parent != document.body
        && !this.isSimpleSelectorElement(parent, sel)) {
      parent = parent.parentElement;
    }
    return (!parent || (parent == document.body && !this
        .isSimpleSelectorElement(parent, sel))) ? undefined : parent;
  };

  Evernote.SearchHelperContentScript.prototype.isSimpleSelectorElement = function(
      e, sel) {
    var selObj = (typeof sel == 'string') ? this.simpleSelectorObj(sel) : sel;
    if (selObj.tagName && selObj.tagName != e.nodeName) {
      return selObj.tagName == "*";
    }
    if (selObj.id && selObj.id != e.getAttribute("id")) {
      return false;
    }
    if (selObj.classList) {
      var classList = e.classList;
      for ( var c = 0; c < selObj.classList.length; c++) {
        if (!classList.contains(selObj.classList[c])) {
          return false;
        }
      }
    }
    return true;
  };

  Evernote.SearchHelperContentScript.prototype.simpleSelectorObj = function(
      selectorText) {
    LOG.debug("SearchHelperContentScript.simpleSelectorObj: " + selectorText);
    var obj = {
      tagName : null,
      id : null,
      classList : null
    };
    if (selectorText.charAt(0) == "#") {
      obj.id = selectorText.substring(1);
    }
    var tagName = selectorText.replace(/\..*$/, "");
    if (tagName) {
      obj.tagName = tagName.toUpperCase();
    }
    var classParts = selectorText.replace(/^[^\.]+/, "").split(".");
    if (classParts) {
      for ( var i = 0; i < classParts.length; i++) {
        if (classParts[i]) {
          if (!(obj.classList instanceof Array)) {
            obj.classList = [];
          }
          obj.classList.push(classParts[i]);
        }
      }
    }
    return obj;
  };

  Evernote.SearchHelperContentScript.prototype.findElements = function(selector) {
    LOG.debug("SearchHelperContentScript.findElements: " + selector);
    var ret = [];
    if (selector.charAt(0) == "#") {
      var e = document.getElementById(selector.substring(1));
      if (e) {
        ret.push(e);
      }
    } else if (selector.charAt(0) == ".") {
      var e = document.getElementsByClassName(selector.substring(1));
      if (e) {
        for ( var i = 0; i < e.length; i++) {
          ret.push(e);
        }
      }
    } else {
      var tagName = selector.split(".");
      var e = document.getElementsByTagName(tagName[0]);
      if (e.length >= 1 && tagName.length >= 1) {
        for ( var i = 0; i < e.length; i++) {
          var classList = e[i].classList;
          var found = true;
          for ( var c = 1; c < tagName.length; c++) {
            if (!classList.contains(tagName[c])) {
              found = false;
              break;
            }
          }
          if (found) {
            ret.push(e[i]);
          }
        }
      } else if (e) {
        ret.concat(e);
      }
    }
    return ret;
  };

  Evernote.SearchHelperContentScript.prototype.extractUrls = function(u) {
    LOG.debug("SearchHelperContentScript.extractUrls: " + u);
    var urlParts = [];
    var urls = [];
    var str = u;
    while (str && str.indexOf("?") > 0) {
      var parts = str.split(/\?+/, 2);
      urlParts.push(str);
      str = (typeof parts[1] == 'string') ? unescape(parts[1]) : null;
    }
    if (str && str.match(/^https?:\/\//)) {
      urlParts.push(str);
    }
    for ( var i = 0; i < urlParts.length; i++) {
      if (!urlParts[i].match(/^https?:\/\//) && urlParts[i].indexOf("&") > 0) {
        var parts = urlParts[i].split("&");
        for ( var p = 0; p < parts.length; p++) {
          var v = parts[p].split("=")[1];
          if (typeof v == 'string' && v.match("^https?:\/\/")) {
            urls.push(v);
          }
        }
      } else {
        urls.push(urlParts[i]);
      }
    }
    return urls;
  };

  Evernote.SearchHelperContentScript.prototype.extractDomains = function(u) {
    LOG.debug("SearchHelperContentScript.extractDomains: " + u);
    var urls = extractUrls(u);
    var domains = [];
    for ( var i = 0; i < urls.length; i++) {
      var d = urls[i].replace(/^https?:\/\/([^\/]+).*$/, "$1");
      if (d && domains.indexOf(d) < 0) {
        domains.push(d);
      }
    }
    return domains;
  };

  Evernote.SearchHelperContentScript.prototype.findTargetElement = function(
      element) {
    LOG.debug("SearchHelperContentScript.findTargetElement");
    if (element instanceof Array) {
      for ( var i = 0; i < element.length; i++) {
        var el = this.findTargetElement(element[i]);
        if (el) {
          return el;
        }
      }
      return null;
    } else if (typeof element == 'string') {
      var x = element.charAt(0);
      if (x == "#") {
        return document.getElementById(element.substring(1));
      } else if (x == ".") {
        return document.getElementsByClassName(element.substring(1))[0];
      }
    } else if (element instanceof Element) {
      return element;
    }
    return null;
  };

  Evernote.SearchHelperContentScript.prototype.disableSearchHelper = function() {
    LOG.debug("SearchHelperContentScript.disableSearchHelper");
    var o = {
      code : Evernote.Constants.RequestType.SEARCH_HELPER_DISABLE
    };
    chrome.extension.sendRequest(o);
  };

  Evernote.SearchHelperContentScript.prototype.findChildren = function(anchor,
      fn, recursive) {
    LOG.debug("SearchHelperContentScript.findChildren");
    var children = new Array();
    if (typeof anchor == 'object' && anchor != null
        && typeof anchor["nodeType"] == 'number' && anchor.nodeType == 1) {
      var childNodes = anchor.childNodes;
      for ( var i = 0; i < childNodes.length; i++) {
        if (typeof fn == 'function' && fn(childNodes[i])) {
          children.push(childNodes[i]);
        } else if (typeof fn != 'function') {
          children.push(childNodes[i]);
        }
        if (recursive && childNodes[i].childElementCount > 0) {
          var otherChildren = arguments.callee(childNodes[i], fn);
          if (otherChildren && otherChildren.length > 0) {
            children = children.concat(otherChildren);
          }
        }
      }
    }
    return children;
  };

  Evernote.SearchHelperContentScript.prototype.bindMessageElements = function() {
    LOG.debug("SearchHelperContentScript.bindMessageElements");
    var nodes = this.findChildren(this.getResultStats(), function(el) {
      try {
        for ( var i = 0; i < el.attributes.length; i++) {
          if (el.attributes[i].name.toLowerCase().indexOf("en-bind") == 0) {
            return true;
          }
        }
      } catch (e) {
      }
      return false;
    }, true);
    if (nodes && nodes.length > 0) {
      for ( var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        for ( var a = 0; a < node.attributes.length; a++) {
          if (node.attributes[a].name.toLowerCase().indexOf("en-bind") == 0) {
            var eventName = node.attributes[a].name.split("-", 3)[2];
            var methName = node.attributes[a].value;
            if (eventName
                && methName
                && (typeof this[methName] == 'function' || typeof window[methName] == 'function')) {
              var t = (typeof this[methName] == 'function') ? this[methName]
                  : window[methName];
              node.removeEventListener(eventName, t, false);
              node.addEventListener(eventName, t, false);
            }
          }
        }
      }
    }
  };

  Evernote.SearchHelperContentScript.prototype.domainAsClassName = function() {
    var domain = location.host;
    if (typeof domain == 'string') {
      domain = domain.replace(/[^a-z0-9]/ig, "_").replace(/_+/g, "_");
    }
    return domain;
  };
})();

