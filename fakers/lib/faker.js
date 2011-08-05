const {PageMod} = require("page-mod");
const {data} = require("self");
const unload = require("unload");

exports.Faker = function(domain, script) {
    let domains = domain.indexOf ? domain : [domain];

    let mod = PageMod({
        include: domains,
        contentScriptWhen: "end",
        contentScriptFile: data.url(script)
    });

    mod.teardown = function() {
      this.destroy();
    };

    unload.ensure(mod, "teardown");

    return mod;
};
