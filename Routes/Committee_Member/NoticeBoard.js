const express = require("express");
const router = express.Router();
const db = require("../../dbconnect");

router.post("/create-notice/:id", async (req, res) => {
  const { id } = req.params;
  const {
    notice_title,
    notice_description,
    notice_type,
    notice_priority,
    Apartment_Name,
  } = req.body;
  // making the raw Json(of Json) to string
  const attachment_details = JSON.stringify(req.body.attachment_details);
  const created_by = id;

  const keys = [];
  const values = [];

  keys.push(
    "notice_title",
    "notice_description",
    "notice_type",
    "attachment_details",
    "notice_priority",
    "created_by"
  );

  values.push(
    notice_title,
    notice_description,
    notice_type,
    attachment_details,
    notice_priority,
    created_by
  );

  const querry = `INSERT INTO ${Apartment_Name}.notice_board (${keys.join(
    ", "
  )}) Values(${values
    .map((value, index) => `$${index + 1}`)
    .join(", ")}) RETURNING *`;

  try {
    const result = await db.query(querry, values);
    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/get-notice/:id", async (req, res) => {
  const { id } = req.params;
  const Apartment_Name = req.body.Apartment_Name;
  const query = `SELECT * FROM ${Apartment_Name}.notice_board WHERE notice_id = $1 `;
  try {
    const result = await db.query(query, [id]);
    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/get-all-notice", async (req, res) => {
  const Apartment_Name = req.body.Apartment_Name;
  const query = `SELECT * FROM ${Apartment_Name}.notice_board`;
  try {
    const result = await db.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

module.exports = router;
