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

exports['onSet called for fields declared in constructor'] = function(test) {
  let name, value;
  model.on("onSet", function(info) {
    name = info.name;
    value = info.value;
  });

  model.first = "Mozilla";
  test.assertEqual(model.first, "Mozilla", "we set mozilla");
  test.assertEqual(name, "first", "first passed as name");
  test.assertEqual(value, "Mozilla", "Mozilla passed as name");
};

exports['onSet:<name> called for fields declared in constructor'] = function(test) {
  let value = false;
  model.on("onSet:first", function(info) {
    value = info;
  });

  model.first = "Mozilla";
  test.assertEqual(value, "Mozilla", "onSet:first called with right value");
};

exports['setting does nothing for fields not declared'] = function(test) {
  let success = true;
  model.on("onSet", function(info) {
    success = false;
  });

  model.unknown = "Mozilla";
  test.assertEqual(success, true, "onSet not called for undeclared variable");
};

exports['test addField'] = function(test) {
  model.addField('newField');
  let success = false;
  model.on("onSet:newField", function() success = true);

  model.newField = "asdf";
  test.assertEqual(success, true, "onSet not called for undeclared variable");
};

exports['test getFields'] = function(test) {
  var fields = model.getFields();
  test.assertEqual(fields.length, 2, 'we have two fields');
};

