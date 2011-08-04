const {Model} = require("sessions/model");

let model;

exports.setup = function() {
  model = Model({
    fields: ['first', 'last']
  });
}

exports.teardown = function() {
  model.teardown();
};

exports['we have an item'] = function(test) {
  test.assertEqual(true, !!model, 'model created');
};

exports['beforeset, set called for fields declared in constructor'] = function(test) {
  let name, value;
  model.on("beforeset", function(info) {
    name = info.name;
    value = info.value;
  });
  model.first = "Mozilla";
  test.assertEqual(name, "first", "first passed as name");
  test.assertEqual(value, "Mozilla", "Mozilla passed as name");

  model.on("set", function(info) {
    name = info.name;
    value = info.value;
  });

  model.first = "Firefox";
  test.assertEqual(model.first, "Firefox", "we set Firefox");
  test.assertEqual(name, "first", "first passed as name");
  test.assertEqual(value, "Firefox", "Firefox passed as name");
};

exports['beforeset:<name>, set:<name> called for fields declared in constructor'] = function(test) {
  let beforesetValue = false,
      value = false;
  model.on("beforeset:first", function(info) {
    beforesetValue = info;
  });
  model.on("set:first", function(info) {
    value = info;
  });

  model.first = "Mozilla";
  test.assertEqual(beforesetValue, "Mozilla", "beforeset:first called with right value");
  test.assertEqual(value, "Mozilla", "set:first called with right value");
};

exports['setting does nothing for fields not declared'] = function(test) {
  let success = true;
  model.on("set", function(info) {
    success = false;
  });

  model.unknown = "Mozilla";
  test.assertEqual(success, true, "set not called for undeclared variable");
};

exports['test addField'] = function(test) {
  model.addField('newField');
  let success = false;
  model.on("set:newField", function() success = true);

  model.newField = "asdf";
  test.assertEqual(success, true, "set not called for undeclared variable");
};

exports['test keys'] = function(test) {
  var fields = model.keys();
  test.assertEqual(fields.length, 2, 'we have two fields');
};

exports['two models play nicely'] = function(test) {
  let model2 = Model({
    fields: ['first', 'last']
  });

  model2.first = "Mozilla";

  test.assertNotEqual(model2.first, model.first, "changing second model does not affect first model");
};

exports['no update if values are the same'] = function(test) {
  model.first = "Mozilla";

  model.on("set", function(info) {
    test.fail("values are the same, set should have never been called");
  });

  model.first = "Mozilla";
  test.pass(); 
};

