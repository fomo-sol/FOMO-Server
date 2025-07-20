const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // env 제일 먼저 로드
require("./config/telegramBot"); // 이후 초기화

const app = express();

// CORS 설정
const corsOptions = {
  origin:
      process.env.NODE_ENV === "production"
          ? "https://fomo.example.com"
          : "http://localhost:3000",
  credentials: false,
};

// 라우터
const indexRouter = require("./routes/index");
const testRouter = require("./routes/test");
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

// view 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 미들웨어
app.use(logger("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 라우팅
app.use("/", indexRouter);
app.use("/api/test", testRouter);
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

// tokenScheduler 스케줄러 실행 (토큰 자동 갱신)
require("./service/Scheduler/tokenScheduler");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
