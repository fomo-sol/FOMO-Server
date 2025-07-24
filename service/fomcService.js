const fomcRepository = require("../repository/fomcRepository");

exports.getFomcDecisionsList = async function (year) {
  return await fomcRepository.getFomcDecision({ year });
};

exports.getFomcMinutesList = async function (year) {
  return await fomcRepository.getFomcMinute({ year });
};

exports.getFomcTypeContent = async (id, type) => {
  return await fomcRepository.fetchFomcTypeContent(id, type);
};

exports.getFomcContentByLang = async (id, type, lang) => {
  return await fomcRepository.fetchFomcContentByLang(id, type, lang);
};

// FOMC 결정 성명서와 연설문 조회 (날짜로)
exports.getFomcContentByDate = async function (date) {
  return await fomcRepository.getFomcContentByDate(date);
};

// FOMC 의사록 조회 (날짜로)
exports.getFomcMinutesByDate = async function (date) {
  return await fomcRepository.getFomcMinutesByDate(date);
};
