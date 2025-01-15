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
  const SelectQuery = `SELECT * FROM ${Apartment_Name}.Committee_Member 
  WHERE Committee_Member_Id = $1;`;

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
  const querry = `SELECT committee_member_id,member_name FROM 
  ${req.body.Apartment_Name}.Committee_Member`;
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

  const querry = `UPDATE ${Apartment_name}.Committee_Member SET ${keys.join(",")} 
  WHERE committee_member_id = ${id} returning Member_Name,Member_status,
  Member_since,Member_until,Member_Permissions,Member_Role`;
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


module.exports = router;
