const {Session} = require("session");
const {CookieMonster} = require("cookie_monster");

let session, cookieManager;

exports.setup = function() {
    cookieManager = new CookieMonster;

    session = new Session({
      host: "http://www.mozilla.com",
      cookieManager: cookieManager 
    });
};

exports["check which fields there are"] = function(test) {
  let fields = session.keys();
  test.assertEqual(fields.length, 2, "we have the correct number of fields");
};

exports["getActive with no active email"] = function(test) {
  let active = session.getActive();

  test.assertUndefined(active, "no active email gives back undefined");
};

exports["getActive with one email"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com"
  }];
  let active = session.getActive();

  test.assertEqual(active.email, "labs@mozilla.com", "one email gives first by default");
};

exports["getActive with multiple emails, none active"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com"
  },
  {
    email: "stomlinson@mozilla.com" 
  }];
  let active = session.getActive();

  test.assertUndefined(active, "multiple emails, none marked active, none returned");

};

exports["getActive with multiple emails, one active"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    status: "active"
  },
  {
    email: "stomlinson@mozilla.com" 
  }];
  let active = session.getActive();

  test.assertEqual(active.email, "labs@mozilla.com", "multiple emails, none marked active, none returned");

};

exports["noInfo with no cookies set, resets sessions"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com"
  }];
  session.noInfo();

  test.assertEqual(session.sessions, undefined, "noInfo with no cookies set resets all sessions");
};


exports["noInfo with cookie set, keeps current session"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];
  session.noInfo();

  let active = session.getActive();
  let email = active && active.email;
  test.assertEqual(email, "labs@mozilla.com", "noInfo with cookies set keeps previous email.");

};


exports["changing a cookie then calling noInfo resets sessions"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];

  cookieManager.simulate("http://www.mozilla.com", "SID", "newValue");

  session.noInfo();

  let active = session.getActive();
  test.assertUndefined(active, "noInfo with after cookies are cleared clears sessions");
};

exports["changing the sessions causes old bindings to be forgotten"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];

  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SSID"
    }
  }];

  cookieManager.simulate("http://www.mozilla.com", "SID", "newValue");

  session.noInfo();

  let active = session.getActive();
  test.assertEqual(active.email, "labs@mozilla.com", "active email not reset when original cookie erased");

};
