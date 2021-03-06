// Requiring necessary npm packages
var express = require("express");
var session = require("express-session");
// Requiring passport as we've configured it
var passport = require("./config/passport");
var flash = require("connect-flash");

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8066;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our database and logging a message to the user upon success
// const dotenv = require('dotenv');
// dotenv.config();



db.sequelize.sync().then(function() {
  var server = app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  });

  // Requiring socket for chat
  var io = require("socket.io")(server);
  // namespace
  const nsp = io.of("/chat");
  nsp.on("connection", function(socket){
    socket.on("chat message", function(msg){
      nsp.emit("chat message", msg);
    });
  });
});


