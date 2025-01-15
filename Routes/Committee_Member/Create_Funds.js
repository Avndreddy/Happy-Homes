const express = require("express");
const router = express.Router();
const verifyToken = require("../../AuthController/jwtVerification");
const db = require("../../dbconnect");

// Post a new Fund Types
router.post("/create-types-of-funds/:cid", verifyToken, async (req, res) => {
  const Created_by = req.params.cid;
  const {
    Fund_Name,
    Fund_Description,
    Fund_Collection_Period,
    Payment_Applicable_to,
    Fund_Amount,
    isRecuring,
    isOptional,
    Payment_Due_Date,
    Fund_Action_Status,
    Apartment_Name,
  } = req.body;

  const keys = [
    "Fund_Name",
    "Fund_Description",
    "Fund_Collection_Period",
    "Payment_Applicable_to",
    "Fund_Amount",
    "isRecuring",
    "isOptional",
    "Payment_Due_Date",
    "Created_by",
    "Fund_Action_Status",
  ];
  const values = [
    Fund_Name,
    Fund_Description,
    Fund_Collection_Period,
    JSON.stringify(Payment_Applicable_to),
    Fund_Amount,
    isRecuring,
    isOptional,
    Payment_Due_Date,
    Created_by,
    Fund_Action_Status,
  ];
  const query = `INSERT INTO ${Apartment_Name}.Types_of_Funds (${keys.join(
    ", "
  )}) VALUES (${values
    .map((value, index) => {
      return `$${index + 1}`;
      console.log(index);
    })
    .join(", ")}) RETURNING *`;

  console.log(query);
  try {
    const result = await db.query(query, values);
    console.log(result.rows);
    res.status(200).send(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Update Fund Types
router.put("/update-types-of-funds/:id/:cid", verifyToken, async (req, res) => {
  const types_of_funds_id = req.params.id;
  const Created_by = req.params.cid;
  const {
    Fund_Name,
    Fund_Description,
    Fund_Collection_Period,
    Payment_Applicable_to,
    Fund_Amount,
    isRecuring,
    isOptional,
    Payment_Due_Date,
    Fund_Action_Status,
    Apartment_Name,
  } = req.body;

  console.log(
    types_of_funds_id,
    Created_by,
    Fund_Name,
    Fund_Description,
    Fund_Collection_Period,
    Payment_Applicable_to,
    Fund_Amount,
    isRecuring,
    isOptional,
    Payment_Due_Date,
    Fund_Action_Status,
    Apartment_Name
  );
  let keys = [];
  let values = [];

  const funds = {
    Fund_Name: Fund_Name,
    Fund_Description: Fund_Description,
    Fund_Collection_Period: Fund_Collection_Period,
    Payment_Applicable_to: JSON.stringify(Payment_Applicable_to),
    Fund_Amount: Fund_Amount,
    isRecuring: isRecuring,
    isOptional: isOptional,
    Payment_Due_Date: Payment_Due_Date,
    Created_by: Created_by,
    Fund_Action_Status: Fund_Action_Status,
  };

  Object.entries(funds).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(`${key} = $${keys.length + 1}`);
      values.push(value);
    }
  });


  const query = `UPDATE ${Apartment_Name}.Types_of_Funds SET ${keys.join(
    ", "
  )} WHERE types_of_funds_id = ${types_of_funds_id} returning *`;
  try {
    const result = await db.query(query, values);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating fund" });
  }
});

router.get('/get-fund-type/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const {Apartment_Name} = req.body;
    const query = `SELECT * FROM ${Apartment_Name}.Types_of_Funds WHERE types_of_funds_id = $1`;
    try {
        const result = await db.query(query, [id]);
        res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching fund type" });
            }
})

router.get('/get-all-fund-type', verifyToken, async (req, res) => {
    const {Apartment_Name} = req.body;
    const query = `SELECT * FROM ${Apartment_Name}.Types_of_Funds`;
    try {
        const result = await db.query(query);
        res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching fund type" });
            }
})

module.exports = router;
