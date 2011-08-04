const {Faker} = require("faker");
const {Helpers} = require("helpers");

var faker;

exports.teardown = function() {
    faker.teardown();
};

exports['can create with single page'] = function(test) {
    faker = Faker("*.google.com", "faker_test.js");

    test.assertNotUndefined(faker, 'a faker has been created');

    var include = faker.include;
    test.assertEqual(1, include.length, 'includes has 1 item');
};

exports['can create with multiple matches'] = function(test) {
    faker = Faker(["*.google.com", "http://google.com/*"], "faker_test.js");

    var include = faker.include;
    test.assertEqual(2, include.length, 'includes has 2 item');
};


