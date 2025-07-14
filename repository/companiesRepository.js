const dummyCompanies = [
    {
        id: "AAPL",
        name: "Apple Inc.",
        name_kr: "애플",
        sector: "Technology",
    },
    {
        id: "TSLA",
        name: "Tesla Inc.",
        name_kr: "테슬라",
        sector: "Automotive",
    },
    {
        id: "NVDA",
        name: "NVIDIA Corporation",
        name_kr: "엔비디아",
        sector: "Semiconductors",
    },
];

exports.getAllCompanies = async () => {
    return dummyCompanies;
};

exports.searchCompanies = async (keyword) => {
    return dummyCompanies.filter((c) =>
        c.name.toLowerCase().includes(keyword.toLowerCase()) ||
        c.name_kr.includes(keyword.toLowerCase()) ||
        c.id.toLowerCase().includes(keyword.toLowerCase())
    );
};