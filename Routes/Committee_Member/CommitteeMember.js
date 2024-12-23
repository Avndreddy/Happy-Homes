const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../../dbconnect");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../../AuthController/jwtVerification");

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
      expiresIn: "1h",
    });
    // Sending the token back to the client
    return res.status(200).send({ token: token });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

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
    Apartment_name
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
    familyMembers
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


router.get('/get-all-users', verifyToken, async (req,res)=>{
  const {Apartment_name}=req.body;
  const querryview = `CREATE VIEW querryview AS SELECT User_name,
    User_email,
    Flat_number,
    Member_Type,
    Occupied_Date,
    Vacated_Date,
    familyMembers FROM ${Apartment_name}.User`;
  const querry= `SELECT * FROM ${Apartment_name}.User`;
  try{
      const result = await db.query(querry);
      if(!result.rows[0]){
          return res.status(404).json({message: "No users found"});
      }
      return res.status(200).json(result.rows);
  }catch(error){
      console.log(error);
      return res.status(500).send('Something went wrong.')
  }
});

module.exports = router;
