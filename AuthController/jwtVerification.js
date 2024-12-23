const jwt = require('jsonwebtoken');
require("dotenv").config();

function verifyToken(req, res, next) {
    let token = req.header('Authorization');
    if (!token){
        return res.status(401).send({ message: 'Token is missing or Unauthorized' });
    }
    token = token.replace('Bearer ', '');
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(400).send('Invalid token');
    }
}

module.exports = verifyToken;