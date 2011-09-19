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

    monster.watch("mozilla", "monster", function(value) {
        success = true;
    });


    obSvc.notify("cookie-changed", {
        QueryInterface:function() {
            return {
                name: 'monster',
                host: 'mozilla'
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

exports["batch cookie delete causes no problems"] = function(test) {
  monster.watch("mozilla", "test-cookie", function(value) {
  });
  // XXX Figure this out, using the obersverService perhaps?
};

exports["clear cookies"] = function(test) {
  monster.watch("mozilla", "test-cookie", function(value) {
  });
  // XXX Figure this out, using the obersverService perhaps?
};

