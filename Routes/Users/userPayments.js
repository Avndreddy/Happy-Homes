const express = require("express");
const router = express.Router();
const db = require("../../dbconnect");
const getPreSignedURL = require("../s3/putObject");
const getUserDocs = require("../s3/getObject");
const deleteObject = require("../s3/deleteObject");
const verifyToken = require("../../AuthController/jwtVerification");

// post Payment details
router.post("/create-user-payment/:id", async (req, res) => {
  const User_Id = req.params.id;
  const {
    Fund_Type_Id,
    Transaction_Id,
    Payment_Document_Id,
    Payment_Method,
    Payment_Date,
    Payment_Amount,
    Payment_Status,
    Payment_Comment,
    Payment_Reviewed_By,
    Payment_Action_Status,
    Apartment_Name,
  } = req.body;

  const User_Payments = {
    fund_type_id: Fund_Type_Id,
    User_Id: User_Id,
    Transaction_Id: Transaction_Id,
    Payment_Document_Id: Payment_Document_Id,
    Payment_Method: Payment_Method,
    Payment_Date: Payment_Date,
    Payment_Amount: Payment_Amount,
    Payment_Status: Payment_Status,
    Payment_Comment: Payment_Comment,
    Payment_Reviewed_By: Payment_Reviewed_By,
    Payment_Action_Status: Payment_Action_Status,
  };

  let keys = [];
  let values = [];

  Object.entries(User_Payments).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(key);
      values.push(value);
    }
  });

  const query = `INSERT INTO ${Apartment_Name}.User_Payments (${keys.join(
    ", "
  )}) 
  VALUES(${values
    .map((value, index) => `$${index + 1}`)
    .join(", ")}) RETURNING *`;

  try {
    await db.query(`BEGIN`);
    const result = await db.query(query, values);
    await db.query(`COMMIT`);
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.log(error);
    await db.query(`ROLLBACK`);
    res.status(500).send(error);
  }
});

// Update Payment Details
router.put("/update-user-payment/:id/:cid", verifyToken, async (req, res) => {
  const user_payments_id = req.params.id;
  const payment_reviewed_by = req.params.cid;
  const {
    Fund_Type_Id,
    User_Id,
    Transaction_Id,
    Payment_Document_Id,
    Payment_Method,
    Payment_Date,
    Payment_Amount,
    Payment_Status,
    Payment_Comment,
    Payment_Action_Status,
    Apartment_Name,
  } = req.body;

  const updated_user_payment = {
    user_payments_id: user_payments_id,
    Fund_Type_Id: Fund_Type_Id,
    User_Id: User_Id,
    Transaction_Id: Transaction_Id,
    Payment_Document_Id: Payment_Document_Id,
    Payment_Method: Payment_Method,
    Payment_Date: Payment_Date,
    Payment_Amount: Payment_Amount,
    Payment_Status: Payment_Status,
    Payment_Comment: Payment_Comment,
    Payment_Action_Status: Payment_Action_Status,
    payment_reviewed_by: payment_reviewed_by,
  };

  let keys = [];
  let values = [];

  Object.entries(updated_user_payment).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(`${key} = $${keys.length + 1}`);
      values.push(value);
    }
  });

  values.push(user_payments_id);

  console.log(keys, values);

  const query = `UPDATE ${Apartment_Name}.User_Payments SET ${keys.join(
    ", "
  )} WHERE user_payments_id = $${keys.length + 1}`;
  console.log(query);

  try {
    const result = await db.query(query, values);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/delete/object", async (req, res) => {
  const { name, key } = req.body;
  try {
    const result = await deleteObject(name, key);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/get-all-users-payments", async (req, res) => {
  const {Apartment_Name} = req.body;
  const query = `Select * from ${Apartment_Name}.User_Payments`;
  console.log(query)
  try {
    const result = await db.query(query);
    console.log(result.rows);
    res.status(200).send(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/get-user-payments-by/:uid",verifyToken , async (req, res) => {
  
});

router.get("/get-payment-by/:id",verifyToken , async (req, res) => {
  
});


module.exports = router;
