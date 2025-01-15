const express = require("express");
const router = express.Router();
const db = require("../../dbconnect");

// Create a New Notice
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


// Get Notice by ID
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

// Get All Notice
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

// Update a Notice by Id
router.put("/update-notice/:id/:cid", async (req, res) => {
  const { id, cid } = req.params;
  const {
    notice_title,
    notice_description,
    notice_type,
    notice_priority,
    Apartment_Name,
  } = req.body;
  const created_by = cid;
  let keys = [];
  let values = [];
  const fields = {
    notice_title: notice_title,
    notice_description: notice_description,
    notice_type: notice_type,
    notice_priority: notice_priority,
    created_by: created_by,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(`${key} = $${keys.length + 1}`);
      values.push(value);
    }
  });
  
  const querry = `Update ${Apartment_Name}.notice_board set ${keys.join(
    ", "
  )} where notice_id = ${id} returning *`;
 
  try {
    const result = await db.query(querry, values);
    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    if(error.constraint == 'fk_noticeboard_created_by'){
        return res.status(500).send("There is no such Committee Member");
    }else{
        return res.status(500).json(error);
    }
    
  }
});

module.exports = router;
