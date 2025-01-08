const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../../dbconnect");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../../AuthController/jwtVerification");
const getPreSignedURL = require("../s3/putObject");

// Register a New Committee Member
router.post("/register-committee-member", async (req, res) => {
  // Hashing the password using bcrypt meathod with env.password_salt
  req.body.Member_Password = bcrypt.hashSync(req.body.Member_Password, 10);
  const {
    User_Id,
    Member_Name,
    Member_Role,
    Member_Permissions,
    Member_since,
    Member_until,
    Member_status,
    Member_Password,
    Apartment_Name,
  } = req.body;

  const query = `INSERT INTO ${Apartment_Name}.Committee_Member (User_Id, Member_Name, Member_Role, 
  Member_Permissions, Member_since, Member_until, Member_status, Member_Password
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`;

  try {
    const result = await db.query(query, [
      User_Id,
      Member_Name,
      Member_Role,
      Member_Permissions,
      Member_since,
      Member_until,
      Member_status,
      Member_Password,
    ]);
    console.log("New Committee Member Added");
    return res.status(200).send("New Committee Member Added");
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

// Login a Committee Member
router.post("/login-committee-member", async (req, res) => {
  const { Committee_Member_Id, Member_Password, Apartment_Name } = req.body;
  // Check if the user exists in the database
  const SelectQuery = `SELECT * FROM ${Apartment_Name}.Committee_Member WHERE Committee_Member_Id = $1;`;

  try {
    // Selecting the committee member from the database using the committee member id
    const result = await db.query(SelectQuery, [Committee_Member_Id]);
    // check for valid user and password
    if (!result.rows[0]) {
      return res.status(401).send("Invalid Credientials");
    } else if (
      !(await bcrypt.compare(Member_Password, result.rows[0].member_password))
    ) {
      return res.status(401).send("Invalid Credientials");
    }
    // Creating Token Payload
    const payload = {
      Committee_Member_Id,
    };
    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "24d",
    });
    // Sending the token back to the clients
    return res.status(200).send({ token: token });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

// To get Committee menbers
router.get("/get-committee-users", verifyToken, async (req, res) => {
  const querry = `SELECT committee_member_id,member_name FROM happyhomes.Committee_Member`;
  try {
    const result = await db.query(querry);
    if (!result.rows) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Some thing went wrong");
  }
});

// Update Committee Member
router.put("/update-committee-member/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    Member_Name,
    Apartment_name,
    Member_status,
    Member_since,
    Member_until,
    Member_Permissions,
    Member_Role,
  } = req.body;
  const fields = {
    member_name: Member_Name,
    member_status: Member_status,
    member_since: Member_since,
    member_until: Member_until,
    member_permissions: Member_Permissions,
    member_role: Member_Role,
  };

  const keys = [];
  const values = [];

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      keys.push(`${key} = $${keys.length + 1}`);
      values.push(value);
    }
  });

  const querry = `UPDATE ${Apartment_name}.Committee_Member SET ${keys.join(
    ","
  )} WHERE committee_member_id = ${id} returning  Member_Name,Member_status,Member_since,Member_until,Member_Permissions,Member_Role`;
  try {
    const result = await db.query(querry, values);
    if (!result.rows) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Some thing went wrong");
  }
});

// Create Add new Users
router.post("/create-new-users", verifyToken, async (req, res) => {
  const {
    User_name,
    User_email,
    User_password,
    Flat_number,
    Member_Type,
    Occupied_Date,
    Vacated_Date,
    Family_Members,
    Apartment_name,
  } = req.body;

  const querry = `INSERT INTO ${Apartment_name}.User (User_name,User_email,User_password,
  Flat_number,Member_Type,Occupied_Date,Vacated_Date,Family_Members) 
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;

  // Ensure Family_Members is passed as a valid JSON object
  const familyMembers = JSON.stringify(Family_Members);

  const querryWithFlats = `UPDATE ${Apartment_name}.Flats SET IsOccupied=true, 
  Owner_id=$1, Occupied_by=$1 WHERE Flat_number = $2 RETURNING *`;

  const values = [
    User_name,
    User_email,
    User_password,
    Flat_number,
    Member_Type,
    Occupied_Date,
    Vacated_Date,
    familyMembers,
  ];

  try {
    await db.query("BEGIN");

    const result = await db.query(querry, values);

    console.log(typeof result.rows[0].User_Id);
    if (Flat_number) {
      const result2 = await db.query(querryWithFlats, [
        result.rows[0].user_id,
        Flat_number,
      ]);
      await db.query("COMMIT");
      return res.status(200).json(result2.rows[0]);
    }
    await db.query("COMMIT");
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    await db.query("ROLLBACK");
    console.log(error, "\nHence Rollbacked");
    return res.status(500).json(error.message);
  }
});

// Get All the users in the apartment
router.get("/get-all-users", verifyToken, async (req, res) => {
  const { Apartment_name } = req.body;
  const querry = `SELECT User_name,
    User_email,
    Flat_number,
    Member_Type,
    Occupied_Date,
    Vacated_Date,
    Family_Members FROM ${Apartment_name}.User`;
  try {
    const result = await db.query(querry);
    if (!result.rows[0]) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong.");
  }
});

// Get a single users in the apartment using ID
router.get("/get-user-by-id/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { Apartment_name } = req.body;
  const querry = `SELECT User_id,User_name, User_email, Flat_number, Member_Type, Occupied_Date, Vacated_Date, Family_Members FROM ${Apartment_name}.User WHERE User_id = $1`;
  try {
    const result = await db.query(querry, [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: "No user found" });
    }
    return res.status(200).json(result.rows);
  } catch (erro) {
    console.log(erro);
    return res.status(500).send("Something went wrong.");
  }
});

// Update a user details in the apartment
router.put("/update-user/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    User_name,
    User_email,
    Flat_number,
    Member_Type,
    Occupied_Date,
    Vacated_Date,
    Family_Members,
  } = req.body;
  const { Apartment_name } = req.body;
  const keys = [];
  const values = [];
  if (User_name) {
    keys.push(` User_name = $${keys.length + 1}`);
    values.push(User_name);
  }
  if (User_email) {
    keys.push(` User_email = $${keys.length + 1}`);
    values.push(User_email);
  }
  if (Flat_number) {
    keys.push(` Flat_number = $${keys.length + 1}`);
    values.push(Flat_number);
  }
  if (Member_Type) {
    keys.push(` Member_Type = $${keys.length + 1}`);
    values.push(Member_Type);
  }
  if (Occupied_Date) {
    keys.push(` Occupied_Date = $${keys.length + 1}`);
    values.push(Occupied_Date);
  }
  if (Vacated_Date) {
    keys.push(` Vacated_Date = $${keys.length + 1}`);
    values.push(Vacated_Date);
  }
  if (Family_Members) {
    keys.push(` Family_Members = $${keys.length + 1}`);
    values.push(Family_Members);
  }
  const querry = `UPDATE ${Apartment_name}.User SET ${keys.join(
    ","
  )} WHERE User_id = ${id} returning User_name,
    User_email,
    Flat_number,
    Member_Type,
    Occupied_Date,
    Vacated_Date,
    Family_Members`;
  try {
    const result = await db.query(querry, values);
    if (!result.rows[0]) {
      return res.status(404).json({ message: "No user found" });
    }
    return res.status(200).json(result.rows);
  } catch (erro) {
    console.log(erro);
    return res.status(500).send("Something went wrong.");
  }
});

// Generate a AWS Presigned PutObject Url
router.get("/get-preSignedUrl", async (req, res) => {
  // const {id} = req.params;
  const { Document_Name, File_Type } = req.body;
  try {
    const url = await getPreSignedURL(Document_Name, File_Type);
    res.status(200).json({ url: url });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Upload a User Document
router.post("/put-user-documents/:id", async (req, res) => {
  const { id } = req.params; 
  // user ID from params
  const User_id = id;
  // Values from request body
  const value = ({
    Document_Name,
    Document_Type,
    Flat_number,
    Uploaded_by,
    Modified_by,
  } = req.body);
  const { Apartment_Name } = req.body;

  // Generating Public S3 URL for the uploaded file
  const s3_link = `https://${process.env.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${Document_Name}`;
  console.log(s3_link,User_id);

  // Set all the values into the an Array for the query
  const values = [
    User_id,
    Document_Name,
    Document_Type,
    Flat_number,
    s3_link,
    Uploaded_by,
    Modified_by,
  ];
  
  // querry
  const querry = `INSERT INTO ${Apartment_Name}.User_Documents
  (User_Id, Document_Name, Document_Type, Flat_number, s3_link,
  Uploaded_by, Modified_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

  try{
    await db.query("BEGIN")
    // execute querry
    const result = await db.query(querry, values);
    await db.query("COMMIT");
    res.status(200).json("Document is Uploaded Successfully!"); 
  }catch(error){
    await db.query("ROLLBACK")
    res.status(500).send(error);
  }

});

module.exports = router;
