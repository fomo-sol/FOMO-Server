const companiesRepository = require("../repository/companiesRepository");

exports.fetchCompanies = async (query) => {
    const { search } = query;

    if (search) {
        return await companiesRepository.searchCompanies(search);
    }

    return await companiesRepository.getAllCompanies();
};