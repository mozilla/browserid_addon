"use strict";
const {data} = require("self");
const {PageMod} = require("page-mod");
const {Helpers} = require("helpers");
const {WindowManager} = require("sessions/window_manager");
const {TabManager} = require("sessions/tab_manager");
const tabs = require("tabs");
const timers = require("timers");

exports.MainSession = function() {
  let windowManager = new WindowManager();
  windowManager.on("login", emitEvent.bind(null, "emitevent.login"));
  windowManager.on("logout", emitEvent.bind(null, "emitevent.logout"));

  let tabManager = new TabManager();
  let pageMod = PageMod({
      include: ["*"],
      contentScriptWhen: "start",
      contentScriptFile: data.url("sessions/page_interaction.js"),
      onAttach: function(worker) {
          // only do this if we are in a tab - jetpack panels cause
          // a worker to be created as well, but we don't want to bind
          // to them.
          if(worker.tab) {
              // Save off which worker we have to respond to for this 
              // particular tab.  Because every page may have multiple workers,
              // one for the main page content and one for each IFRAME, we have 
              // to keep track of which one is the top level user content. 
              // Unfortunately there is no easy way of knowing this 
              // information until we get a response from the content script 
              // which is forced to only respond if it is at the top level.
              worker.tab.topLevelWorker = worker;
              worker.port.on("sessions.set", onSessionSet.bind(worker));
              worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker));
              worker.port.on("sessions.tabready", onSessionTabReady.bind(worker));
          }
      }
  });



  // Session data has been set for this tab.
  function onSessionSet(data) {
      // We now know for sure which worker to respond to for this tab.
      this.tab.topLevelWorker = this;
      tabManager.sessionUpdate(this.tab, data);
  }


  // A new tab has been opened or its URL has changed.
  function onSessionTabOpen(data) {
      // We now know for sure which worker to respond to for this tab.
      this.tab.topLevelWorker = this;
      tabManager.sessionReset(this.tab, data);
  };

  // The tab's content is ready, if no info has been set, remove the 
  // notification box in the URL bar.
  function onSessionTabReady() {
      tabManager.tabReady(this.tab);
  };

  // emit the login or logout event to the active tab.  This happens when the 
  // user interacts with the notification box in the URL bar.
  function emitEvent(eventName) {
      let tab = tabs.activeTab;
      if(tab) {
          tab.topLevelWorker.port.emit(eventName);
      }
  };

}

