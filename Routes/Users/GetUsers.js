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

module.exports=router;