const fomcRepo = require("../repository/fomcRepository");

exports.getFomcList = async () => {
    const data = await fomcRepo.fetchFomcList();
    return data;
};

exports.getFomcDetailById = async (id) => {
    return await fomcRepo.fetchFomcById(id);
};

exports.getFomcTypeContent = async (id, type) => {
    return await fomcRepo.fetchFomcTypeContent(id, type);
};

exports.getFomcContentByLang = async (id, type, lang) => {
    return await fomcRepo.fetchFomcContentByLang(id, type, lang);
};