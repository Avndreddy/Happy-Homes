// Imports
const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../dbconnect");

// import table/,modles Commands
// const {
//   create_SuperUser_Table,
//   insert_into_SuperUser_Table,
// } = require("../Models/DB_Variables");
const {
  create_SuperUser_Table,
  insert_into_SuperUser_Table,
  Individual_Apartment_Schema,
  Individual_Apartment_Table,
  Individual_Users,
  Alter_Individual_Apartment_Table,
  Individual_Apartment_Committee_Member_Table,
  insert_into_Apartment_Committee_Member_Table,
  Individual_Users_Documents_Table,
  Notice_Board_Table,
  Complaints_Board,
  Types_of_Funds,
  User_Payments,
  Payment_Documents,
  Alter_User_Payments,
  // Alter_Individual_Apartment_Committee_Member_Table,
  Committee_Funds_Usage,
  Auto_generate_Flats_Data_according_to_Floors,
} = require("../Models/Create_apartments");
// Routes
router.post("/add-new-apartment", async (req, res) => {
  const body = req.body;
  body.Apartment_Floors = JSON.stringify(body.Apartment_Floors);
  Apartment_Name = body.Apartment_Name;
  Apartment_Name = Apartment_Name.split(" ").join("");
  console.log(Apartment_Name);
  try {
    // Creating SuperUser Table
    await db.query(create_SuperUser_Table());
    const reqValues = Object.values(body);
    // Inserting data into SuperUser table
    await db.query(insert_into_SuperUser_Table(), reqValues);

    // Each Apartment Schema
    await db.query(Individual_Apartment_Schema(Apartment_Name));
    // Create into Individual Apartment Table
    await db.query(Individual_Apartment_Table(Apartment_Name));
    // Insert into Flats Table [Auto Generate the Flats based on number of Flats and Floors]
    JSON.parse(req.body.Apartment_Floors).map(async (Ele) => {
      let Floor = Ele.floor;
      let Flat_Number;
      const Initial_Flat_Number_Counter = 100 * Floor;
      for (let i = 1; i <= Ele.flats; i++) {
        Flat_Number = Initial_Flat_Number_Counter + i;
        await db.query(
          `INSERT INTO ${Apartment_Name}.Flats(Flat_number,Floor) VALUES (${Flat_Number},${Floor})`
        );
      }
    });
    // Create into Individual Users Table
    await db.query(Individual_Users(Apartment_Name));
    // Alter Individual Apartment Table
    await db.query(Alter_Individual_Apartment_Table(Apartment_Name));
    // Create Committee Member Table
    await db.query(Individual_Apartment_Committee_Member_Table(Apartment_Name));
    // Insert into Committee Member Table[Creating initial Committee member]
    await db.query(
      insert_into_Apartment_Committee_Member_Table(Apartment_Name)
    );
    // Create User Documents Table
    await db.query(Individual_Users_Documents_Table(Apartment_Name));
    // Create Notice Board Table
    await db.query(Notice_Board_Table(Apartment_Name));
    // Create Complaints Board Table
    await db.query(Complaints_Board(Apartment_Name));
    // Create Types_of_Funds Table
    await db.query(Types_of_Funds(Apartment_Name));
    // Create User Payments
    await db.query(User_Payments(Apartment_Name));
    // Create Payment Documents
    await db.query(Payment_Documents(Apartment_Name));
    // Alter User Payments
    await db.query(Alter_User_Payments(Apartment_Name));
    // // ALTER Committee_Member
    // await db.query(
    //   Alter_Individual_Apartment_Committee_Member_Table(Apartment_Name)
    // );
    // Create Committee Funds Usage Table
    await db.query(Committee_Funds_Usage(Apartment_Name));

    return res
      .status(200)
      .send("your Personilised DB is created according to your needs");
  } catch (error) {
    console.log(error, "Hence ROLLBACKED");
    return res.status(500).send(error.message);
  }
});

router.patch("/update-new-apartment/:id", async (req, res) => {
  // Can Directly Updates from DB
});

module.exports = router;
