// routes/test.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send("message is required");

  try {
    const conn = await pool.getConnection();
    await conn.query("INSERT INTO testdb (message) VALUES (?)", [message]);
    conn.release();
    res.status(201).send("message inserted");
  } catch (err) {
    console.error("POST /api/test error:", err);
    res.status(500).send("DB insert failed");
  }
});

router.get("/", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM testdb ORDER BY id DESC");
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error("GET /api/test error:", err);
    res.status(500).send("DB query failed");
  }
});

module.exports = router;
