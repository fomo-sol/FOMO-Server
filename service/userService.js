const userRepo = require("../repository/userRepository");

exports.registerUser = async (userData) => {
    return await userRepo.registerUser(userData);
};

exports.loginUser = async (credentials) => {
    return await userRepo.loginUser(credentials);
};

exports.logoutUser = async () => {
    return await userRepo.logoutUser();
};

exports.getUserInfo = async () => {
    return await userRepo.getUserInfo();
};
