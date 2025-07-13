const favoriteService = require("../service/favoritesService");

exports.getFavorites = async (req, res) => {
    const data = await favoriteService.fetchFavorites();
    res.json({ success: true, data });
};

exports.addFavorite = async (req, res) => {
    const data = await favoriteService.createFavorite(req.body);
    res.json({ success: true, data });
};

exports.deleteFavorite = async (req, res) => {
    await favoriteService.removeFavorite(req.params.id);
    res.json({ success: true });
};

exports.initFavorites = async (req, res) => {
    const data = await favoriteService.initFavorites(req.body);
    res.json({ success: true, data });
};

exports.getFavoriteCount = async (req, res) => {
    const count = await favoriteService.getFavoritesCount();
    res.json({ success: true, count });
};