const {Faker} = require("./faker");

exports.Fakers = function() {
    let fakerGoogle = Faker(["*.google.com", "http://google.com/*", "https://google.com/*"], "faker_google.js");
    let fakerWikipedia = Faker(["*.wikipedia.org", "http://wikipedia.org/*", "https://wikipedia.org/*"], "faker_wikipedia.js");
    let fakerTwitter = Faker(["*.twitter.com", "http://twitter.com/*", "https://twitter.com/*"], "faker_twitter.js");
};


