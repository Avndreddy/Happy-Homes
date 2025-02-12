const express = require("express");
const router = express.Router();
const db = require("../dbconnect");
const getPreSignedURL = require("./s3/putObject");
const getUserDocs = require("./s3/getObject");
const deleteObject = require("./s3/deleteObject");
const renameObject = require("./s3/renameObject");
const verifyToken = require("../AuthController/jwtVerification");

// Post a new document to the AWS
router.post("/create-payment-document", verifyToken, async (req, res) => {
  const uid = req.params.id;
  const { Apartment_Name, Payment_Document_Name, document_type } = req.body;
  const userPayment = {
    Payment_Document_Name: Payment_Document_Name,
    document_type: document_type
  };

  let keys = [];
  let values = [];

  Object.entries(userPayment).forEach(([key,value])=>{
    if(value !== undefined){
        values.push(value);
        keys.push(key);
    }
  })

  const query = `INSERT into ${Apartment_Name}.Payment_Documents (${keys.join(", ")}) VALUES (${values.map((value, index)=> `$${index+1}`).join(', ')}) RETURNING payment_document_id;`;
  console.log(query);
  try{
    const result = await db.query(query, values);
    console.log(result.rows[0]);
    res.status(200).send(result.rows[0])
  }catch(error){
    console.log(error);
    res.status(500).send(error);
  }
});

// Get preSigned put Object URL
router.get('/getPreSignedPUTURL-paymentDocuments', verifyToken, async (req, res) => {
    const { Payment_Document_Name, document_type, File_Type } = req.body;
    try {
      const url = await getPreSignedURL(Payment_Document_Name, document_type, File_Type);
      res.status(200).json({ url: url });
    } catch (err) {
      res.status(500).send(err);
    }
})

// Get Payment Documents
router.get('/getPresignedGETURL-paymentDocuments', verifyToken, async (req, res) => {
    const { Payment_Document_Name, document_type } = req.body;
    console.log(Payment_Document_Name,document_type)
    try {
      const url = getUserDocs(Payment_Document_Name, document_type);
      res.status(200).json(url);
    } catch (error) {
      res.status(500).send(error);
    }
})

router.put('/create-payment-document/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    oldkey={
        document_type: "Payment Document",
        Payment_Document_Name: "Medihub.mp4"
    }
    newKey={
 document_type: "Payment Document",
        Payment_Document_Name: "MedihubRemaned.mp4"
    }
    renameObject(oldkey,newKey);
})

module.exports = router;