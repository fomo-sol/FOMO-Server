
const fomcRepository = require("../repository/fomcRepository");

exports.getFomcDecisionsList = async function (year) {
    return await fomcRepository.getFomcDecision({year});
}

exports.getFomcMinutesList = async function (year) {
    return await fomcRepository.getFomcMinute({year});
}

exports.getFomcTypeContent = async (id, type) => {
    return await fomcRepository.fetchFomcTypeContent(id, type);
};

exports.getFomcContentByLang = async (id, type, lang) => {
    return await fomcRepository.fetchFomcContentByLang(id, type, lang);
};