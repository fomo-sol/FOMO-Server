const companyService = require("../service/companiesService");


// /api/companies
exports.getCompanies = async (req, res) => {
    try {
        const companies = await companyService.fetchCompanies(req.query);
        res.json({ success: true, data: companies });
    } catch (err) {
        console.error("Company fetch error:", err);
        res.status(500).json({ success: false, message: "기업 정보를 불러올 수 없습니다." });
    }
};

//  /api/companies/search
exports.getSearchCompanies = async (req, res) => {
    try {
        const companies = await companyService.fetchCompanies(req.query);
        res.json({ success: true, data: companies });
    } catch (err) {
        console.error("Company fetch error:", err);
        res.status(500).json({ success: false, message: "기업 정보를 불러올 수 없습니다." });
    }
}
