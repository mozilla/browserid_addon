"use strict";
const {data} = require("self");
const {Widget} = require("widget");
const {PageMod} = require("page-mod");
const {Fakers} = require("./fakers");
const {Helpers} = require("./helpers");
const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
const tabs = require("tabs");
Fakers();

let windowManager = new WindowManager();
windowManager.on("login", onLogin);
windowManager.on("logout", onLogout);
let tabManager = new TabManager();

let currWorker;

let pageMod = PageMod({
    include: ["*"],
    contentScriptWhen: "start",
    contentScriptFile: data.url("page_interaction.js"),
    onAttach: function(worker) {
        Helpers.workers.prepare(worker);

        worker.tab.worker = worker;
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




function onLogin() {
    console.log("received login here");
    let tab = tabs.activeTab;
    if(tab) {
        tab.worker.port.emit("emitevent.login");
    }
};

function onLogout() {
    let tab = tabs.activeTab;
    if(tab) {
        tab.worker.port.emit("emitevent.logout");
    }
};

function onSession() {

};



