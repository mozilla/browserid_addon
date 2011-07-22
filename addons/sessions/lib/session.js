let {Model} = require("model");

let Session = function() {};

Session.prototype = new Model({
    fields: ['email', 'status']
});

exports.Session = Session;
