const userService = require("../service/userService");

exports.registerUser = async (req, res) => {
    const result = await userService.registerUser(req.body);
    res.json({ success: true, data: result });
};

exports.loginUser = async (req, res) => {
    const result = await userService.loginUser(req.body);
    res.json({ success: true, data: result });
};

exports.logoutUser = async (req, res) => {
    const result = await userService.logoutUser();
    res.json({ success: true, message: result });
};

exports.getUserInfo = async (req, res) => {
    const result = await userService.getUserInfo();
    res.json({ success: true, data: result });
};
