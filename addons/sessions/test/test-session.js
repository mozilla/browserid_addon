const {Session} = require("session");
const {CookieMonster} = require("cookie_monster");
const {Bindings} = require("bindings");

let session, bindings, cookieManager;

exports.setup = function() {
    if(!cookieManager) {
      cookieManager = new CookieMonster();
    }
    cookieManager.clear();

    if(!bindings) {
      bindings = new Bindings({
        cookieManager: cookieManager
      });
    }
    bindings.clear();

    session = new Session({
      host: "www.mozilla.com",
      bindings: bindings 
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

exports["noInfo after session without cookie after session with cookie has no info."] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];
  session.sessions = [{
    email: "labs@mozilla.com"
  }];
  session.noInfo();

  let active = session.getActive();
  test.assertUndefined(active, "Calling noInfo after setting sessions with no bindings clears bindings");
};


exports["changing a cookie then calling noInfo resets sessions"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];

  cookieManager.simulate("www.mozilla.com", "SID", "newValue");
  session.noInfo();

  let active = session.getActive();
  test.assertUndefined(active, "noInfo after cookies are cleared clears sessions");
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

  cookieManager.simulate("www.mozilla.com", "SID", "newValue");
  session.noInfo();

  let active = session.getActive();
  test.assertEqual(active.email, "labs@mozilla.com", "active email not reset when original cookie erased");
};

exports["Changing the host clears the sessions"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];

  session.host = "labs.mozilla.com";

  let active = session.getActive();
  test.assertUndefined(active, "setting the host clears the active sessions");
};

exports["Changing the host, then going back to host gets former session"] = function(test) {
  session.sessions = [{
    email: "labs@mozilla.com",
    bound_to: {
      type: "cookie",
      name: "SID"
    }
  }];

  session.host = "labs.mozilla.com";
  session.host = "www.mozilla.com";

  let active = session.getActive();
  test.assertNotUndefined(active, "going back to host that had a binding restores sessions");

  session.noInfo();
  active = session.getActive();
  test.assertNotUndefined(active, "going back to host that had a binding restores sessions");
};

exports["creating a session with no bindings still allows noInfo to be called"] = function(test) {
  let session = new Session();

  session.noInfo();
  test.pass();
};









