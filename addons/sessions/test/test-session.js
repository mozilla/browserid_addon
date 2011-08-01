const {Session} = require("session");

let session;

exports.setup = function() {
    session = new Session();
};

exports['check which fields there are'] = function(test) {
  let fields = session.keys();
  test.assert(fields.length, 1, 'we have the correct number of fields');
};

exports['getActive with no active email'] = function(test) {
  let active = session.getActive();

  test.assertUndefined(active, 'no active email gives back undefined');
};

exports['getActive with one email'] = function(test) {
  session.sessions = [{
    email: 'labs@mozilla.com'
  }];
  let active = session.getActive();

  test.assertEqual(active.email, 'labs@mozilla.com', 'one email gives first by default');
};

exports['getActive with multiple emails, none active'] = function(test) {
  session.sessions = [{
    email: 'labs@mozilla.com'
  },
  {
    email: 'stomlinson@mozilla.com' 
  }];
  let active = session.getActive();

  test.assertUndefined(active, 'multiple emails, none marked active, none returned');

};

exports['getActive with multiple emails, one active'] = function(test) {
  session.sessions = [{
    email: 'labs@mozilla.com',
    status: 'active'
  },
  {
    email: 'stomlinson@mozilla.com' 
  }];
  let active = session.getActive();

  test.assertEqual(active.email, 'labs@mozilla.com', 'multiple emails, none marked active, none returned');

};



