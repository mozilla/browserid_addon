const main = require("main");


exports.test_id = function(test) {
  test.assert(require("self").id.length > 0);
};

