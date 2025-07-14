var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

var indexRouter = require("./routes/index");
const testRouter = require("./routes/test");
var hantuRouter = require("./routes/hantu");

const dotenv = require("dotenv");
dotenv.config();

const mainRouter = require("./routes/main");
const fomcRouter = require("./routes/fomc");
const earningsRouter = require("./routes/earnings");
const navRouter = require("./routes/nav");
const calendarRouter = require("./routes/calendar");
const companiesRouter = require("./routes/companies");
const favoritesRouter = require("./routes/favorites");
const notificationsRouter = require("./routes/notifications");
const telegramRouter = require("./routes/telegram");
const userRouter = require("./routes/user");


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/test", testRouter);
app.use("/api/hantu", hantuRouter);

app.use("/api/main", mainRouter);
app.use("/api/fomc", fomcRouter);
app.use("/api/earnings", earningsRouter);
app.use("/api/nav", navRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/telegram", telegramRouter);
app.use("/api/user", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
