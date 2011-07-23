const {Model} = require("model");

let model;

exports.setup = function() {
  model = Model({
    fields: ['first', 'last']
  });
}

exports['we have an item'] = function(test) {
  test.assertEqual(true, !!model, 'model created');
};

exports['set called for fields declared in constructor'] = function(test) {
  let name, value;
  model.on("set", function(info) {
    name = info.name;
    value = info.value;
  });

  model.first = "Mozilla";
  test.assertEqual(model.first, "Mozilla", "we set mozilla");
  test.assertEqual(name, "first", "first passed as name");
  test.assertEqual(value, "Mozilla", "Mozilla passed as name");
};

exports['set:<name> called for fields declared in constructor'] = function(test) {
  let value = false;
  model.on("set:first", function(info) {
    value = info;
  });

  model.first = "Mozilla";
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

