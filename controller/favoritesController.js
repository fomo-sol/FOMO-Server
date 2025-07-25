const favoriteService = require("../service/favoritesService");

exports.getFavorites = async (req, res) => {
    const user_id = req.params.user_id;

    const data = await favoriteService.fetchFavorites(user_id);
    res.json({ success: true, data });
};

exports.addFavorites = async (req, res) => {
    try {
        const { user_id } = req.params;
        const favoritesList = req.body;

        if (!favoritesList || !Array.isArray(favoritesList)) {
            return res.status(400).json({ success: false, message: "유효하지 않은 요청입니다." });
        }

        const formattedList = favoritesList.map(f => ({
            ...f,
            user_id
        }));

        const result = await favoriteService.addFavorites(formattedList);

        if (result === "DUPLICATE") {
            return res.status(400).json({ success: false, message: "중복입니다." });
        }

        res.json({ success: true, added: result });
    } catch (err) {
        console.error("관심 종목 추가 실패:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteFavorite = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { stock_id } = req.body;

        if (!stock_id) {
            return res.status(400).json({ success: false, message: "stock_id가 필요합니다." });
        }

        await favoriteService.removeFavorite(stock_id, user_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};