
let dummyFavorites = [
    { id: "1", stock_id: "AAPL", user_id: "user123" },
    { id: "2", stock_id: "TSLA", user_id: "user123" },
];

exports.getFavorites = async () => {
    return dummyFavorites;
};

exports.addFavorite = async (favorite) => {
    const newFavorite = {
        id: String(dummyFavorites.length + 1),
        ...favorite,
    };
    dummyFavorites.push(newFavorite);
    return newFavorite;
};

exports.deleteFavorite = async (id) => {
    dummyFavorites = dummyFavorites.filter((f) => f.id !== id);
    return true;
};

exports.initFavorites = async (favoritesList) => {
    dummyFavorites = [...favoritesList];
    return dummyFavorites;
};

exports.countFavorites = async () => {
    return dummyFavorites.length;
};