const earningsRepository = require("../repository/earningsRepository");

function formatRevenue(value) {
    const num = typeof value === 'bigint' ? Number(value) : Number(value);
    if (isNaN(num)) return "-";

    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2) + "B";
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2) + "M";
    } else {
        return num.toLocaleString();
    }
}

function parseQuarter(finInfoName) {
    const baseYear = 2020;
    const quarterNum = Number(finInfoName);
    const year = baseYear + Math.floor((quarterNum - 1) / 4);
    const quarter = ((quarterNum - 1) % 4) + 1;
    return `${year}년 ${quarter}분기`;
}

function formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
}


exports.fetchEarningsList = async ({ page, limit }) => {

    const offset = (page - 1) * limit;

    const earningsStocks = await earningsRepository.getStocksOrderRankedByOffset(limit, offset);

    const earningsDetailFinances = await earningsRepository.getEarningsDetailFinanceById(earningsStocks);

    const merged = earningsStocks.map(stock => {
        const detail = earningsDetailFinances.find(fin => fin.id === stock.id);
        return {
            ...stock,
            finances: detail ? detail.finances : [],
        };
    });


    return {merged};
};

exports.fetchEarningsById = async (id) => {
    const earningFinances = await earningsRepository.getEarningsById(id);

    const stock = {
        id: earningFinances.id,
        stock_name: earningFinances.stock_name,
    };

    const finances = earningFinances.finances.map(fin => ({
        id: fin.id,
        fin_quarter: parseQuarter(fin.fin_info_name),
        fin_release_date: formatDate(fin.fin_release_date),
        fin_period_date: formatDate(fin.fin_period_date),
        fin_eps_value: fin.fin_eps_value,
        fin_eps_forest: fin.fin_eps_forest,
        fin_revenue_value: formatRevenue(fin.fin_revenue_value),
        fin_revenue_forest: formatRevenue(fin.fin_revenue_forest),
    }));

    return { stock, finances };
};

exports.fetchEarningsLangContent = async (id, lang) => {
    return await earningsRepository.getEarningsLangContent(id, lang);
};