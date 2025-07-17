const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authenticate = require("../common/middlewareAuth");

router.post("/register", (req, res, next) => {
    console.log("[ROUTER] POST /api/user/register 요청 들어옴");
    next();
}, userController.register);

router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.get("/me", authenticate, userController.getUserInfo);
router.post("/fcm", authenticate, userController.registerFcmToken);

module.exports = router;
