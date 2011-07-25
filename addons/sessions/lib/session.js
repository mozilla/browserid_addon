let {Model} = require("model");

let Session = function() {
    let session = new Model({
        fields: ['sessions']
    });
    return session;
};

exports.Session = Session;
