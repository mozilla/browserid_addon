const {EventEmitter} = require("events");

let Model = EventEmitter.compose({
  constructor: function(options) {
    let fields = options.fields;
    this._model = {};
    this._fields = [];

    fields.forEach(this.addField, this);
  },

  _model: undefined,
  _fields: undefined,

  addField: function(name) {
      this._model[name] = undefined;
      this._fields.push(name);
      this._public.__defineSetter__(name, this._onSet.bind(this, name));
      this._public.__defineGetter__(name, this._onGet.bind(this, name));
  },

  keys: function() {
     return this._fields; 
  },

  _onSet: function(name, value) {
    if(this._model[name] !== value) {
      this._emit("beforeset", {
        name: name,
        value: value
      });
      this._emit("beforeset:" + name, value);

      this._model[name] = value;

      this._emit("set", {
        name: name,
        value: value
      });
      this._emit("set:" + name, value);
    }
  },

  _onGet: function(name) {
    return this._model[name];
  }
});

exports.Model = Model;
