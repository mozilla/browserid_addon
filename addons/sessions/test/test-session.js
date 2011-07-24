const {Session} = require("session");

let session;

exports.setup = function() {
    session = new Session();
};

exports['check which fields there are'] = function(test) {
  var fields = session.keys();
  test.assert(fields.length, 1, 'we have the correct number of fields');
};
