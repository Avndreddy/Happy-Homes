const express= require('express');
const verifyToken = require('../../AuthController/jwtVerification');
const router = express.Router();

// Needs Apartment name to get the users with token validation
router.get('/get-all-users', verifyToken, async (req,res)=>{
    
    try{
        const {Apartment_name}=req.body;
        const users = await User.find({Apartment_name: Apartment_name}).select('-user_password');
        const querry= `SELECT * FROM ${Apartment_name}.User`;
        const result = await db.query(querry);
        if(!result.rows[0]){
            return res.status(404).json({message: "No users found"});
        }
        return res.status(200).json(users);
    }catch(error){
        console.log(error);
        return res.status(500).send('Something went wrong.')
    }
});


// Get a single users in the apartment using ID
router.get("/get-user-by-id/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { Apartment_name } = req.body;
    const querry = `SELECT User_id,User_name, User_email, Flat_number, 
    Member_Type, Occupied_Date, Vacated_Date, Family_Members FROM 
    ${Apartment_name}.User WHERE User_id = $1`;
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
  

module.exports=router;