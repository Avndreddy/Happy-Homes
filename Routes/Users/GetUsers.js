const express= require('express');
const verifyToken = require('../../AuthController/jwtVerification');
const router = express.Router();

router.get('/get-all-users', verifyToken, async (req,res)=>{
    const {Apartment_name}=req.body;
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

module.exports=router;