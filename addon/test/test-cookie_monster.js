const {CookieMonster} = require("sessions/cookie_monster");
const obSvc = require("observer-service");
const {Cc, Ci} = require("chrome");

var monster;

exports.setup = function() {
    monster = new CookieMonster();
};

exports.teardown = function() {
    monster.teardown();
};

exports["can create"] = function(test) {
    test.assertEqual(true, monster instanceof CookieMonster, "we have a monster on our hands");
};

exports["can watch"] = function(test) {
    monster.watch("mozilla", "test-cookie", function(value) {
        test.assertEqual("test-value", value, "we got the right value");
        test.done();
    });

    monster.simulate("mozilla", "test-cookie", "test-value");
    test.waitUntilDone();
};

exports["can unwatch"] = function(test) {
    var success = true;
    var callback = function() {
        success = false;
    };

    monster.watch("mozilla", "test-cookie", callback);
    monster.unwatch("mozilla", "test-cookie", callback);
    monster.simulate("mozilla", "test-cookie", "test-value");

    test.assertEqual(true, success, "unregister failure, callback should not have been called");
};


exports["changes with cookie"] = function(test) {
    var success=false;

    monster.watch("Mozilla", "monster", function(value) {
        success = true;
    });


    obSvc.notify("cookie-changed", {
        QueryInterface:function() {
            return {
                name: 'monster',
                host: 'Mozilla'
            };
        }
    }, "added");

    test.assertEqual(success, true, "our cookie stuff works!");
};

exports["clear clears bindings"] = function(test) {
    monster.watch("mozilla", "test-cookie", function(value) {
      test.fail("monster should have been cleared");
    });

    monster.clear();
    monster.simulate("mozilla", "test-cookie", "test-value");

    test.pass();
};

exports["simulate cookies being cleared"] = function(test) {
  let callbackCalled = false;
  monster.watch("mozilla", "test-cookie", function(value) {
    callbackCalled = true;
  });

  monster.simulateCookieSvc(null, "cleared");

  test.assertEqual(callbackCalled, true, "when clearing cookies, the session was cleared");
};


exports["simulate cookies being reloaded"] = function(test) {
  let callbackCalled = false;
  monster.watch("mozilla", "test-cookie", function(value) {
    callbackCalled = true;
  });

  monster.simulateCookieSvc(null, "reload");

  test.assertEqual(callbackCalled, true, "when clearing cookies, the session was cleared");
};


exports["simulate cookies batch-deleted"] = function(test) {
  let callbackCalled = false, callback2Called = false;
  monster.watch("mozilla", "test-cookie", function(value) {
    callbackCalled = true;
  });
  monster.watch("mozilla", "test-cookie2", function(value) {
    callback2Called = true;
  });

  monster.simulateCookieSvc([
    {
      QueryInterface: function() {
        return {
          name: "test-cookie",
          host: "mozilla"
        }
      }
    },

    {
      QueryInterface: function() {
        return {
          name: "test-cookie2",
          host: "mozilla"
        }
      }

    }
  ], "batch-deleted");

  test.assertEqual(callbackCalled && callback2Called, true, "both cookies cleared on batch-delete");
};

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    var cookie = name+"="+value+expires+"; path=/";
    return cookie;
}
