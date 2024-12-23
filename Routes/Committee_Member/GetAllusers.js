const express = require("express");
const router = express.Router();
const db = require("../../dbconnect");
const verifyToken = require("../../AuthController/jwtVerification");

router.get("/get-committee-users", verifyToken, async (req, res) => {
  const querry = `SELECT committee_member_id,member_name FROM happyhomes.Committee_Member`;
  try {
    const result = await db.query(querry);
    if (!result.rows) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Some thing went wrong");
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

  // Ensure Family_Members is passed as a valid JSON object
  const familyMembers = JSON.stringify(Family_Members);

  const querry = `INSERT INTO ${Apartment_name}.User (User_name,User_email,User_password,
  Flat_number,Member_Type,Occupied_Date,Vacated_Date,Family_Members) 
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;

  const updateflatsquerry = `UPDATE ${Apartment_name}.Flats SET IsOccupied=true, 
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
      const result2 = await db.query(updateflatsquerry, [
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
module.exports = router;
