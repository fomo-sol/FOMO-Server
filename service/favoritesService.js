const favoritesRepo = require("../repository/favoritesRepository");

exports.fetchFavorites = async () => {
    return await favoritesRepo.getFavorites();
};

exports.createFavorite = async (favorite) => {
    return await favoritesRepo.addFavorite(favorite);
};

exports.removeFavorite = async (id) => {
    return await favoritesRepo.deleteFavorite(id);
};

exports.initFavorites = async (list) => {
    return await favoritesRepo.initFavorites(list);
};

exports.getFavoritesCount = async () => {
    return await favoritesRepo.countFavorites();
};