const {Faker} = require("faker");
const {Helpers} = require("helpers");

var faker;

exports['can create with single page'] = function(test) {
    faker = Faker("*.google.com", "faker_google.js");

    test.assertNotUndefined(faker, 'a faker has been created');

    var include = faker.include;
    test.assertEqual(1, include.length, 'includes has 1 item');
    faker.teardown();
};

exports['can create with multiple matches'] = function(test) {
    faker = Faker(["*.google.com", "http://google.com/*"], "faker_google.js");

    var include = faker.include;
    test.assertEqual(2, include.length, 'includes has 2 item');
    faker.teardown();
};


