const {EventEmitter} = require("events");

let Model = EventEmitter.compose({
  constructor: function(options) {
    let fields = options.fields;
    this._fields = [];
    
    fields.forEach(this.addField, this);
  },

  _fields: undefined,
  _model: {},

  addField: function(name) {
      this._fields.push(name);
      this._public.__defineSetter__(name, this._onSet.bind(this, name));
      this._public.__defineGetter__(name, this._onGet.bind(this, name));
  },

  getFields: function() {
     return this._fields; 
  },

  _onSet: function(name, value) {
    this._model[name] = value;

    this._emit("onSet", {
      name: name,
      value: value
    });

    this._emit("onSet:" + name, value);
  },

  _onGet: function(name) {
    return this._model[name];
  }
});

exports.Model = Model;
