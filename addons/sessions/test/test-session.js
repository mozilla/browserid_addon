const {Session} = require("session");

let session;

exports.setup = function() {
    session = new Session();
};

exports['check which fields there are'] = function(test) {
  var fields = session.getFields();
  test.assert(fields.length, 2, 'we have two fields');
};
