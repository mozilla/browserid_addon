const {PageMod} = require("page-mod");
const {data} = require("self");

exports.Faker = function(domain, script) {
    var domains = domain.indexOf ? domain : [domain];

    return PageMod({
        include: domains,
        contentScriptWhen: "end",
        contentScriptFile: data.url(script)
    });
};
