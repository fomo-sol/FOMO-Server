const favoritesRepo = require("../repository/favoritesRepository");

exports.fetchFavorites = async (user_id) => {
    return await favoritesRepo.getFavorites(user_id);
};

exports.addFavorites = async (favoritesList) => {
    const hasDuplicate = await favoritesRepo.checkDuplicateFavorites(favoritesList);
    if (hasDuplicate) return "DUPLICATE";

    return await favoritesRepo.insertFavorites(favoritesList);
};

exports.removeFavorite = async (stock_id, user_id) => {
    return await favoritesRepo.deleteFavorite(stock_id, user_id);
};
