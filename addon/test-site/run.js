var express = require("express");
var app = express.createServer();

app.use(express.bodyParser());


app.configure(function() {
  app.set("views", __dirname + "/views");
});

app.get("/", function(req, res) {
  res.render("index.ejs", {
    title: "Main page" 
  });
});

app.get("/set_login.html", function(req, res) {
  res.render("set_login.ejs", {
    title: "Login without cookie"
  });
});

app.get("/set_login_with_iframe.html", function(req, res) {
  res.render("set_login_with_iframe.ejs", {
    title: "Login without cookie, add iframe"
  });
});

app.get("/set_cookie.html", function(req, res) {
  res.cookie("SID", "fakeSID");
  res.render("set_cookie.ejs", {
    title: "Login with cookie"
  });
});

app.get("/logout.html", function(req, res) {
  res.clearCookie("SID");
  res.render("logout.ejs", {
    title: "You are logged out"
  });
});

app.listen(8000);

