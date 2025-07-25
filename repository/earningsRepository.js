const pool = require("../config/db");

async function getEarningsResultsById(id) {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT 
        fr.id,
        fr.stock_finances_id,
        fr.stock_release_content_en,
        fr.stock_release_content_kr,
        fr.stock_release_content_an,
        fr.created_at
      FROM finance_releases fr
      WHERE fr.stock_finances_id = ?`,
      [id]
    );
    conn.release();
    return rows || null;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getStockIdBySymbol(symbol) {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      `
                SELECT id
                FROM stocks
                WHERE stock_symbol = ? LIMIT 1
            `,
      [symbol]
    );
    conn.release(); // 연결 해제 꼭 필요

    if (rows.length === 0) {
      throw new Error(`Symbol not found: ${symbol}`);
    }

    return rows;
  } catch (err) {
    console.error("not found symbol id", err);
    throw err;
  }
}

async function getStockFinancesByStockId(stockId) {
  try {
    const conn = await pool.getConnection();

    const rows = await conn.query(
      `
            SELECT 
                id,
                stock_id,
                fin_release_date,
                fin_period_date,
                fin_eps_value,
                fin_eps_forest,
                fin_revenue_value,
                fin_hour,
                fin_revenue_forest,
                fin_info_name
            FROM stock_finances
            WHERE stock_id = ?
            ORDER BY fin_release_date DESC
            LIMIT 2
            `,
      [stockId]
    );

    conn.release();
    return rows;
  } catch (err) {
    console.error("getStockFinancesByStockId DB Error:", err);
    throw err;
  }
}

const getMyFavoritesStocks = async (myFavoritesStocks) => {
  try {
    // 여러 기업 정보를 순회하며 각각 최신 2개 재무 데이터를 가져옴
    const results = await Promise.all(
      myFavoritesStocks.map(async (stock) => {
        const stockId = stock.stock_id;

        // 예: DB 쿼리 or API 요청
        const finances = await getStockFinancesByStockId(stockId);

        // 최신 fin_release_date 기준 정렬 후 상위 2개만 추출
        const sortedFinances = finances
          .sort(
            (a, b) =>
              new Date(b.fin_release_date) - new Date(a.fin_release_date)
          )
          .slice(0, 2);

        return {
          ...stock,
          finances: sortedFinances,
        };
      })
    );
    return results;
  } catch (error) {
    console.error("getMyFavoritesStocks Error:", error);
    throw error;
  }
};

const getEarningsDetailFinanceById = async (earningFinance) => {
  try {
    // 여러 기업 정보를 순회하며 각각 최신 2개 재무 데이터를 가져옴
    const results = await Promise.all(
      earningFinance.map(async (stock) => {
        const stockId = stock.id;

        // 예: DB 쿼리 or API 요청
        const finances = await getStockFinancesByStockId(stockId);

        // 최신 fin_release_date 기준 정렬 후 상위 2개만 추출
        const sortedFinances = finances
          .sort(
            (a, b) =>
              new Date(b.fin_release_date) - new Date(a.fin_release_date)
          )
          .slice(0, 2);

        return {
          ...stock,
          finances: sortedFinances,
        };
      })
    );

    return results;
  } catch (err) {
    console.error("getEarningsDetailFinanceById err", err);
    throw err;
  }
};

const getEarningsById = async (id) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT
                 s.id,
                 s.stock_name,
                 s.stock_name_kr,
                 s.stock_symbol,
                 s.stock_cik,
                 s.stock_excd,
                 s.stock_rank,
                 s.stock_logo_img,
                 s.sector_id,
                 s.industry_id,
                 sf.id AS finance_id,
                 sf.fin_release_date,
                 sf.fin_period_date,
                 sf.fin_eps_value,
                 sf.fin_eps_forest,
                 sf.fin_revenue_value,
                 sf.fin_hour,
                 sf.fin_revenue_forest,
                 sf.fin_info_name,
                 sf.created_at
             FROM stocks s
                      LEFT JOIN stock_finances sf ON s.id = sf.stock_id
             WHERE s.id = '${id}';
            `,
      [id]
    );
    conn.release();

    const stock = {
      id: rows[0].id,
      stock_name: rows[0].stock_name,
      stock_name_kr: rows[0].stock_name_kr,
      stock_symbol: rows[0].stock_symbol,
      stock_cik: rows[0].stock_cik,
      stock_excd: rows[0].stock_excd,
      stock_rank: rows[0].stock_rank,
      stock_logo_img: rows[0].stock_logo_img,
      sector_id: rows[0].sector_id,
      industry_id: rows[0].industry_id,
    };

    const finances = rows.map((row) => ({
      id: row.finance_id,
      fin_release_date: row.fin_release_date,
      fin_period_date: row.fin_period_date,
      fin_eps_value: row.fin_eps_value,
      fin_eps_forest: row.fin_eps_forest,
      fin_revenue_value: row.fin_revenue_value,
      fin_revenue_forest: row.fin_revenue_forest,
      fin_info_name: row.fin_info_name,
      fin_hour: row.fin_hour,
      created_at: row.created_at,
    }));
    return { stock, finances };
  } catch (err) {
    console.error("getEarningsById error:", err);
    throw err;
  }
};

const getStocksOrderRankedByOffset = async (limit, offset) => {
  const conn = await pool.getConnection();

  try {
    const rows = await conn.query(
      `
            SELECT
                s.id,
                s.stock_name AS name,
                s.stock_name_kr AS name_kr,
                s.stock_symbol AS symbol,
                s.stock_rank AS rank,
                s.stock_logo_img AS logo,
                sec.sector_name AS sector,
                ind.industries_name AS industry
            FROM stocks s
            JOIN sectors sec ON s.sector_id = sec.id
            JOIN industries ind ON s.industry_id = ind.id
            ORDER BY s.stock_rank ASC
            LIMIT ? OFFSET ?
            `,
      [limit, offset]
    );
    conn.release();
    return rows;
  } catch (err) {
    console.error("getStocksOrderRankedByOffset error:", err);
    throw err;
  } finally {
    conn.release();
  }
};

const getEarningsEXCD = async (symbol, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1초

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT stock_excd FROM stocks WHERE stock_symbol = ?",
      [symbol]
    );
    conn.release();

    if (rows.length > 0) {
      return rows[0].stock_excd;
    } else {
      throw new Error("Symbol not found");
    }
  } catch (err) {
    console.error(
      `getEarningsEXCD error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`,
      err.message
    );

    // 연결 관련 에러인지 확인
    const isConnectionError =
      err.errno === 45028 || // pool timeout
      err.errno === 45012 || // connection timeout
      err.code === "ER_CONNECTION_TIMEOUT" ||
      err.code === "ECONNRESET" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT";

    // 재시도 가능한 에러이고 최대 재시도 횟수에 도달하지 않았다면 재시도
    if (isConnectionError && retryCount < MAX_RETRIES) {
      console.log(
        `🔄 Retrying getEarningsEXCD for ${symbol} in ${RETRY_DELAY}ms...`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * (retryCount + 1))
      );
      return getEarningsEXCD(symbol, retryCount + 1);
    }

    // 재시도 불가능하거나 최대 재시도 횟수에 도달한 경우
    if (isConnectionError) {
      console.error(
        `❌ Max retries reached for getEarningsEXCD (${symbol}). Returning null.`
      );
      return null; // 에러를 throw하지 않고 null 반환
    }

    // 다른 에러는 그대로 throw
    throw err;
  }
};

const langContent = {
  1: {
    ko: "애플 2025년 2분기 실적 발표 예정 (한국어)",
    en: "Apple Q2 2025 earnings announcement (English)",
    summary: "AI 요약: 예상보다 높은 EPS 발표 가능성",
  },
  2: {
    ko: "테슬라 2025년 2분기 실적 (한국어)",
    en: "Tesla Q2 2025 earnings (English)",
    summary: "AI 분석: 시장 기대 상회",
  },
};

exports.getMyFavoritesStocks = getMyFavoritesStocks;
exports.getStockIdBySymbol = getStockIdBySymbol;
exports.getEarningsEXCD = getEarningsEXCD;
exports.getEarningsById = getEarningsById;
exports.getEarningsResultsById = getEarningsResultsById;
exports.getStocksOrderRankedByOffset = getStocksOrderRankedByOffset;
exports.getEarningsDetailFinanceById = getEarningsDetailFinanceById;
exports.getEarningsLangContent = async (id, lang) =>
  langContent[id]?.[lang] || null;
