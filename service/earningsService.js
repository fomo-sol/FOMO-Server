const earningsRepository = require("../repository/earningsRepository");

exports.fetchEarningsList = async (query) => {
    const { filter, sort, search } = query;

    if (filter === "favorite") {
        return await earningsRepository.getFavoriteEarnings();
    }

    if (sort === "announcement_date") {
        return await earningsRepository.getSortedEarnings();
    }

    if (search) {
        return await earningsRepository.searchEarnings(search);
    }

    return await earningsRepository.getAllEarnings();
};

exports.fetchEarningsById = async (id) => {
    return await earningsRepository.getEarningsById(id);
};

exports.fetchEarningsLangContent = async (id, lang) => {
    return await earningsRepository.getEarningsLangContent(id, lang);
};