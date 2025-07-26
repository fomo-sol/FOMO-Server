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

// 결정 날짜로 해당하는 의사록 찾기
exports.getFomcMinutesByDecisionDate = async (decisionDate) => {
  try {
    const minutes = await fomcRepository.getFomcMinutesByDecisionDate(
      decisionDate
    );
    return minutes;
  } catch (err) {
    console.error("Error in getFomcMinutesByDecisionDate service:", err);
    throw err;
  }
};

exports.getFomcAllDate = async () => {
  try {
    const data = await fomcRepository.getFomcAllDate();
    return data;
  } catch (err) {
    console.error("Error in getFomcAllDate service:", err);
    throw err;
  }
};
// 의사록 날짜로 해당하는 결정 찾기
exports.getFomcDecisionByMinutesDate = async (minutesDate) => {
  try {
    const decision = await fomcRepository.getFomcDecisionByMinutesDate(
      minutesDate
    );
    return decision;
  } catch (err) {
    console.error("Error in getFomcDecisionByMinutesDate service:", err);
    throw err;
  }
};
