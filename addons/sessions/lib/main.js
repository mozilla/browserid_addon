"use strict";
const {data} = require("self");
const {Widget} = require("widget");
const {PageMod} = require("page-mod");
const {Fakers} = require("./fakers");
const {Helpers} = require("./helpers");
const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
Fakers();

let windowManager = new WindowManager();
let tabManager = new TabManager();

let currWorker;

let pageMod = PageMod({
    include: ["*"],
    contentScriptWhen: "start",
    contentScriptFile: data.url("page_interaction.js"),
    onAttach: function(worker) {
        Helpers.workers.prepare(worker);

        worker.port.on("sessions.set", onSessionSet.bind(worker));
        worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker));
    }
});



function onSessionSet(data) {
    tabManager.sessionsUpdate(this.tab, data);
}


function onSessionTabOpen() {
    tabManager.sessionReset(this.tab);
};




function loginCallback() {
    if(currWorker) {
        currWorker.port.emit("emitevent.login");
    }
};

function logoutCallback() {
    if(currWorker) {
        currWorker.port.emit("emitevent.logout");
    }
};

function sessionCallback() {
    panel.show(el);
};



