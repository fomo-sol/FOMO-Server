const fomcService = require("../service/fomcService");

// /api/fomc/decisions/:id
exports.getFomcDecisions = async function (req, res) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!id && !date) {
      return res.status(400).json({
        success: false,
        message: "ID 또는 date 파라미터가 필요합니다.",
      });
    }

    let data;
    if (id && date) {
      // ID와 date가 둘 다 있으면 date로 조회 (더 구체적)
      data = await fomcService.getFomcContentByDate(date);
    } else if (id) {
      // ID로만 조회 - 기존 로직 사용
      data = await fomcService.getFomcTypeContent(id, "rate");
    } else if (date) {
      // 날짜로만 조회
      data = await fomcService.getFomcContentByDate(date);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "해당 FOMC 결정을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("FOMC 결정 상세 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// /api/fomc/minutes/:id
exports.getFomcminutes = async function (req, res) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!id && !date) {
      return res.status(400).json({
        success: false,
        message: "ID 또는 date 파라미터가 필요합니다.",
      });
    }

    let data;
    if (id && date) {
      // ID와 date가 둘 다 있으면 date로 조회 (더 구체적)
      data = await fomcService.getFomcMinutesByDate(date);
    } else if (id) {
      // ID로만 조회 - 기존 로직 사용
      data = await fomcService.getFomcTypeContent(id, "minutes");
    } else if (date) {
      // 날짜로만 조회
      data = await fomcService.getFomcMinutesByDate(date);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "해당 FOMC 의사록을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("FOMC 의사록 상세 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// /api/fomc/minutes  //fomc 의사록
exports.getFomcMinutesList = async function (req, res) {
  try {
    const year = req.query.year;
    if (!year) {
      return res
        .status(400)
        .json({ success: false, message: "year 파라미터가 필요합니다." });
    }
    const data = await fomcService.getFomcMinutesList(year);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("FOMC 의사록 조회 오류", err);
  }
};

// /api/fomc/decisions   //fomc 결정 성명서
exports.getFomcDecisionsList = async function (req, res) {
  try {
    const year = req.query.year;
    if (!year) {
      return res
        .status(400)
        .json({ success: false, message: "year 파라미터가 필요합니다." });
    }
    const data = await fomcService.getFomcDecisionsList(year);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("FOMC 결정 조회");
  }
};

exports.getFomcType = async (req, res) => {
  const { id, type } = req.params;

  if (!["rate", "minutes"].includes(type)) {
    return res
      .status(400)
      .json({ success: false, message: "유효하지 않은 type입니다" });
  }

  try {
    const data = await fomcService.getFomcTypeContent(id, type);

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "데이터가 없습니다" });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("FOMC 하위 콘텐츠 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

exports.getFomcContentByLang = async (req, res) => {
  const { id, type, lang } = req.params;

  if (!["rate", "minutes"].includes(type)) {
    return res
      .status(400)
      .json({ success: false, message: "유효하지 않은 type입니다" });
  }

  if (!["ko", "en", "summary"].includes(lang)) {
    return res
      .status(400)
      .json({ success: false, message: "유효하지 않은 lang입니다" });
  }

  try {
    const data = await fomcService.getFomcContentByLang(id, type, lang);

    if (!data) {
      return res.status(404).json({ success: false, message: "데이터 없음" });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("언어별 콘텐츠 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 결정 날짜로 해당하는 의사록 찾기
exports.getFomcMinutesByDecisionDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const minutes = await fomcService.getFomcMinutesByDecisionDate(date);

    res.json({
      success: true,
      data: minutes,
    });
  } catch (error) {
    console.error("FOMC minutes by decision date error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 의사록 날짜로 해당하는 결정 찾기
exports.getFomcDecisionByMinutesDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const decision = await fomcService.getFomcDecisionByMinutesDate(date);

    res.json({
      success: true,
      data: decision,
    });
  } catch (error) {
    console.error("FOMC decision by minutes date error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
