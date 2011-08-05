const self = require("self");
const {Helpers} = require("helpers");

let getMostRecentWindowCalled, 
    getMostRecentWindow = Helpers.chrome.getMostRecentWindow,
    getDocumentCalled,
    getDocument = Helpers.chrome.getDocument;

exports.setup = function() {
    getMostRecentWindowCalled = getDocumentCalled = false;

    Helpers.chrome.getMostRecentWindow = function() {
        getMostRecentWindowCalled = true;
        return getMostRecentWindow.apply(null, arguments);
    };

    Helpers.chrome.getDocument = function() {
        getDocumentCalled = true;
        return getDocument.apply(null, arguments);
    };
};

exports.teardown = function() {
    Helpers.chrome.getMostRecentWindow = getMostRecentWindow;
    Helpers.chrome.getDocument = getDocument;
};



exports['toConsole'] = function(test) {
    let logged = [];
    Helpers.toConsole({
        a: true,
        b: 'wee'
    }, {
        log: function(val) {
            logged.push(val);
        }
    });

    test.assertEqual(logged.length, 3, 'three items logged - header + 2 items');
};

exports['getMostRecentWindow'] = function(test) {
    let win = Helpers.chrome.getMostRecentWindow();
    test.assertEqual( !!win, true, 'we have a window!');
};

exports['getDocument no window'] = function(test) {
    let doc = Helpers.chrome.getDocument();
    test.assertNotUndefined(doc, 'we have a doc!');
};

exports['getDocument with window'] = function(test) {
    let win = Helpers.chrome.getMostRecentWindow();
    getMostRecentWindowCalled = false;

    let doc = Helpers.chrome.getDocument(win);
    test.assertNotUndefined(doc, 'we have a doc!');
    test.assertEqual(false, getMostRecentWindowCalled, 'getMostRecentWindow was not called when passed a window');
};

exports['getElementById'] = function(test) {
    let el = Helpers.chrome.getElementById('urlbar-container');

    test.assertNotUndefined(el, 'we have an element!');
    test.assertEqual(typeof el.parentNode, "object", 'has a parent node, can assume it\'s an element');
};

exports['getElementById with document'] = function(test) {
    let doc = Helpers.chrome.getDocument();
    getDocumentCalled = false;
    let el = Helpers.chrome.getElementById('urlbar-container', doc);

    test.assertNotUndefined(el, 'we have an element!');
    test.assertEqual(typeof el.parentNode, "object", 'has a parent node, can assume it\'s an element');
    test.assertEqual(false, getDocumentCalled, 'getDocument was not called when passed a document');
};

exports['simulateDOMEvent with click'] = function(test) {

    let success = false;
    let el = Helpers.chrome.getElementById('urlbar-container');

    el.addEventListener("click", function() {
        success = true;
    }, false);
    Helpers.chrome.simulateDOMEvent(el, "MouseEvents", "click");

    test.assertEqual(success, true, "click event happened");
};

exports['simulateDOMEvent with click and document'] = function(test) {
    let success = false;
    let el = Helpers.chrome.getElementById('urlbar-container');

    let doc = Helpers.chrome.getDocument();
    getDocumentCalled = false;
    el.addEventListener("click", function() {
        success = true;
    }, false);
    Helpers.chrome.simulateDOMEvent(el, "MouseEvents", "click", doc);

    test.assertEqual(success, true, "click event happened");
    test.assertEqual(false, getDocumentCalled, 'getDocument was not called when passed a document');
};

exports['loadStylesheet'] = function(test) {
    let pi = Helpers.chrome.loadStylesheet(self.data.url('styles/identity-sessions.css'));

    test.assertEqual(!!pi, true, 'we have some pi without failure');
}

exports['loadStylesheet with document'] = function(test) {
    let doc = Helpers.chrome.getDocument();
    getDocumentCalled = false;
    let pi = Helpers.chrome.loadStylesheet(self.data.url('styles/identity-sessions.css'), doc);

    test.assertEqual(!!pi, true, 'we have some pi without failure');
    test.assertEqual(false, getDocumentCalled, 'getDocument was not called when passed a document');
}

