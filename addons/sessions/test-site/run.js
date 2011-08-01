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

app.get("/set_cookie.html", function(req, res) {

  res.render("set-cookie.ejs", {
    title: "Your cookie is set"
  });
});

app.listen(8000);

