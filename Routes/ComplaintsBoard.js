const express = require("express");
const router = express.Router();
const db = require("../dbconnect");

// Create a new Complaint
router.post("/create-complaint/:id", async (req, res) => {
  const created_by = req.params.id;
  const {
    Complaint_Title,
    Complaint_Description,
    Complaint_Type,
    Complaint_Status,
    Estimated_cost,
    Fund_Requested,
    Funding_Status,
    Attachemnt,
    Apartment_Name,
  } = req.body;

  const complaint = {
    Complaint_Title: Complaint_Title,
    Complaint_Description: Complaint_Description,
    Complaint_Type: Complaint_Type,
    Complaint_Status: Complaint_Status,
    Estimated_cost: Estimated_cost,
    Fund_Requested: Fund_Requested,
    Funding_Status: Funding_Status,
    Attachemnt: JSON.stringify(Attachemnt),
    created_by: created_by,
  };
  let keys = [];
  let values = [];

  Object.entries(complaint).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(key);
      values.push(value);
    }
  });

  const querry = `INSERT INTO ${Apartment_Name}.complaints_board (${keys.join(
    ", "
  )}) Values(${values
    .map((value, index) => `$${index + 1}`)
    .join(", ")}) RETURNING *`;
  console.log(querry);
  try {
    const result = await db.query(querry, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Get All complaints
router.get("/get-all-complaints", async (req, res) => {
  const { Apartment_Name } = req.body;
  const querry = `SELECT * FROM ${Apartment_Name}.complaints_board`;
  try {
    const result = await db.query(querry);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// get Complaints by ID
router.get("/get-complaint/:id", async (req, res) => {
  const { id } = req.params;
  const { Apartment_Name } = req.body;
  const querry = `SELECT * FROM ${Apartment_Name}.complaints_board Where complaint_id = ${id}`;
  try {
    const result = await db.query(querry);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.put("/update-complaint/:id/:cid", async (req, res) => {
  const complaint_id = req.params.id;
  const created_by = req.params.cid;
  const {
    Complaint_Title,
    Complaint_Description,
    Complaint_Type,
    Complaint_Status,
    // Comments,
    Estimated_cost,
    Fund_Requested,
    ActualCost_used,
    Funding_Status,
    Approved_By,
    Funding_date,
    Attachemnt,
    Apartment_Name,
  } = req.body;

  let complaint = {
    complaint_Title: Complaint_Title,
    complaint_Description: Complaint_Description,
    complaint_Type: Complaint_Type,
    complaint_Status: Complaint_Status,
    // comments: JSON.stringify(Comments),
    estimated_cost: Estimated_cost,
    fund_Requested: Fund_Requested,
    actualCost_used: ActualCost_used,
    funding_Status: Funding_Status,
    approved_By: Approved_By,
    funding_date: Funding_date,
    attachemnt: JSON.stringify(Attachemnt),
  };

  let keys = [];
  let values = [];

  Object.entries(complaint).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(`${key} = $${keys.length + 1}`);
      values.push(value);
    }
  });

  //   remember to never make this Mistack again - complaint_id=${complaint_id}
  //   const querry = `UPDATE ${Apartment_Name}.complaints_board SET (${keys.join(", ")})
  //   WHERE complaint_id=${complaint_id} RETURNING *`;

  // Add complaint_id at the end of the values array
  values.push(complaint_id); // This will be used for the WHERE clause

  // Construct the query string with placeholders
  const query = `UPDATE ${Apartment_Name}.complaints_board 
                 SET ${keys.join(", ")} 
                 WHERE complaint_id = $${keys.length + 1} 
                 RETURNING *`;

  try {
    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.put("/add-comment/:path/:id", async (req, res) => {
  const { path, id } = req.params;
  const { Apartment_Name, comment } = req.body;
  const values = [];
  values.push(JSON.stringify(comment));
  values.push(id);
  function querry() {
    if (path === "complaints") {
      return `UPDATE ${Apartment_Name}.complaints_board SET
        comments = comments || $1 Where complaint_id = $2 RETURNING *`;
    } else if (path === "Notice") {
      return `UPDATE ${Apartment_Name}.notice_board SET
        comments = comments || $1 Where notice_id = $2 RETURNING *`;
    } else {
      return res.status(500).send("Wrong path/ Unorthorised Access");
    }
  }

  try {
    const result = await db.query(querry(), values);
    console.log(result.rows);
    res.status(200).send(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;