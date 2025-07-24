const pool = require("../config/db");

async function getFomcMinute({ year }) {
  try {
    console.log(year);
    const conn = await pool.getConnection();
    const query = `
            SELECT 
                *,
                DATE_FORMAT(fomc_release_date, '%Y-%m-%d') as fomc_release_date_str,
                CONCAT(fomc_release_date, ' 14:00:00') as fomc_release_datetime,
                CONVERT_TZ(CONCAT(fomc_release_date, ' 14:00:00'), '+00:00', 'America/New_York') as fomc_release_date_est
            FROM fomc_minutes
            WHERE YEAR(fomc_release_date) = ?
            ORDER BY fomc_release_date ASC
        `;
    const rows = await conn.query(query, [year]);
    conn.release();
    return rows;
  } catch (err) {
    console.error("Error fetching FOMC getFomcMinutes", err);
    throw err;
  }
}

async function getFomcDecision({ year }) {
  try {
    const conn = await pool.getConnection();

    const query = `
            SELECT 
                id,
                fed_start_time,
                fed_release_date,
                fed_actual_rate,
                fed_forecast_rate,
                fed_previous_rate,
                created_at,
                DATE_FORMAT(fed_release_date, '%Y-%m-%d') as fed_release_date_str,
                CONCAT(fed_release_date, ' 14:00:00') as fed_release_datetime,
                CONVERT_TZ(CONCAT(fed_release_date, ' 14:00:00'), '+00:00', 'America/New_York') as fed_release_date_est,
                CONVERT_TZ(fed_start_time, '+00:00', 'America/New_York') as fed_start_time_est
            FROM fomc_rate_decisions
            WHERE YEAR(fed_release_date) = ?
            ORDER BY fed_release_date ASC
        `;
    console.log("🔍 FOMC 쿼리 실행:", { year });
    const rows = await conn.query(query, [year]);
    console.log("📊 FOMC 쿼리 결과:", rows.length, "개 행");
    if (rows.length > 0) {
      console.log("📅 첫 번째 행:", {
        id: rows[0].id,
        fed_release_date: rows[0].fed_release_date,
        fed_release_date_est: rows[0].fed_release_date_est,
      });
    }
    conn.release();
    return rows;
  } catch (err) {
    console.error("Error fetching FOMC decisions:", err);
    throw err;
  }
}

// FOMC 결정 성명서와 연설문 조회 (날짜로)
async function getFomcContentByDate(date) {
  try {
    const conn = await pool.getConnection();

    // 1. 해당 날짜의 fomc_rate_decisions 조회
    const decisionQuery = `
      SELECT 
        frd.*,
        DATE_FORMAT(frd.fed_release_date, '%Y-%m-%d') as fed_release_date_str,
        CONCAT(frd.fed_release_date, ' 14:00:00') as fed_release_datetime,
        CONVERT_TZ(CONCAT(frd.fed_release_date, ' 14:00:00'), '+00:00', 'America/New_York') as fed_release_date_est,
        CONVERT_TZ(frd.fed_start_time, '+00:00', 'America/New_York') as fed_start_time_est
      FROM fomc_rate_decisions frd
      WHERE DATE(frd.fed_release_date) = ?
    `;
    const decisions = await conn.query(decisionQuery, [date]);

    if (decisions.length === 0) {
      conn.release();
      return null;
    }

    const decisionId = decisions[0].id;

    // 2. 해당 결정의 성명서 조회
    const statementsQuery = `
      SELECT * FROM fomc_decision_statements 
      WHERE fomc_rate_decisions_id = ?
    `;
    const statements = await conn.query(statementsQuery, [decisionId]);

    // 3. 해당 결정의 연설문 조회
    const speechesQuery = `
      SELECT * FROM fomc_speeches 
      WHERE fomc_rate_decisions_id = ?
    `;
    const speeches = await conn.query(speechesQuery, [decisionId]);

    conn.release();

    return {
      decision: decisions[0],
      statements: statements[0] || null,
      speeches: speeches[0] || null,
    };
  } catch (err) {
    console.error("Error fetching FOMC content by date:", err);
    throw err;
  }
}

// FOMC 의사록 조회 (날짜로)
async function getFomcMinutesByDate(date) {
  try {
    const conn = await pool.getConnection();

    // 1. 해당 날짜의 fomc_minutes 조회
    const minutesQuery = `
      SELECT 
        fm.*,
        DATE_FORMAT(fm.fomc_release_date, '%Y-%m-%d') as fomc_release_date_str,
        CONCAT(fm.fomc_release_date, ' 14:00:00') as fomc_release_datetime,
        CONVERT_TZ(CONCAT(fm.fomc_release_date, ' 14:00:00'), '+00:00', 'America/New_York') as fomc_release_date_est
      FROM fomc_minutes fm
      WHERE DATE(fm.fomc_release_date) = ?
    `;
    const minutes = await conn.query(minutesQuery, [date]);

    if (minutes.length === 0) {
      conn.release();
      return null;
    }

    const minutesId = minutes[0].id;

    // 2. 해당 의사록의 스크립트 조회
    const scriptQuery = `
      SELECT * FROM fomc_minutes_script 
      WHERE fomc_minutes_id = ?
    `;
    const scripts = await conn.query(scriptQuery, [minutesId]);

    conn.release();

    return {
      minutes: minutes[0],
      script: scripts[0] || null,
    };
  } catch (err) {
    console.error("Error fetching FOMC minutes by date:", err);
    throw err;
  }
}

// 더미 데이터
const rateContent = {
  1: {
    ko: "2025년 6월 기준금리 발표문 (한국어)",
    en: "June 2025 Rate Statement (English)",
    summary: "AI 요약: 시장 중립적인 금리 동결 발표",
  },
};

const minutesContent = {
  1: {
    ko: "2025년 6월 의사록 (한국어 번역)",
    en: "FOMC Minutes June 2025 (English)",
    summary: "AI 분석: 인플레이션 완화 신호 포착",
  },
};

exports.fetchFomcTypeContent = async (id, type) => {
  let base = null;
  if (type === "rate") base = rateContent;
  if (type === "minutes") base = minutesContent;

  return base?.[id] || null;
};

exports.fetchFomcContentByLang = async (id, type, lang) => {
  let base = null;
  if (type === "rate") base = rateContent;
  if (type === "minutes") base = minutesContent;

  const contentSet = base?.[id];
  return contentSet?.[lang] || null;
};

exports.getFomcMinute = getFomcMinute;
exports.getFomcDecision = getFomcDecision;
exports.getFomcContentByDate = getFomcContentByDate;
exports.getFomcMinutesByDate = getFomcMinutesByDate;
