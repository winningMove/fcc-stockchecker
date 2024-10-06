"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");
const { contentSecurityPolicy } = require("helmet");
const crypto = require("crypto");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.use(
  contentSecurityPolicy({
    directives: {
      "style-src": "self",
      "script-src": "self",
    },
  })
);

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// hash request IP and change it to the hash
app.use((req, res, next) => {
  const { ip } = req;
  req.ip = hashIP(ip);
  next();
});

//Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 3500);
  }
});

function hashIP(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

module.exports = app; //for testing
