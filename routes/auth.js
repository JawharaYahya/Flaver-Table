const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const routeGuard=require("../middleware/verifyToken");

//create profile (secret)path
router.get("/profile",routeGuard, async ( req,res) =>{
try {
      const { username, email } = req.user; // extract from JWT payload

    const result = await pool.query(
      "SELECT username, email FROM users WHERE username = $1 AND email = $2",
      [ username, email]);
    res.json(result.rows[0]);
} catch (error) {
   console.log("error get the data on profile route",error);
   res.status.send("Error getting the data on profile route")
  
}
});


//create register (Post Method)
router.post("/register", async ( req,res) =>{
const {username,email,password}= req.body //extract from the body
try {
    const hashPassword =await bcrypt.hash(password,10);
    const result= await pool.query(
         `INSERT INTO users (username,email, password) VALUES ($1, $2,$3) RETURNING id, username`,
      [username,email,hashPassword]
    );
    return res.status(200).json({ message: "User registered successfully", user: result.rows[0] });
} catch (error) {
    console.log("error registering",error);
    
if(error.code === "23505") {
return res.status(409).json({ message: "Username or email already exists" });
    }
return res.status(500).json({ message: "Internal server error", error: error.message });
}
});

//create login (post method)

router.post("/login", async ( req,res) =>{
const {username,email,password}= req.body //extract from the body
try {

   const userDetails = await pool.query(
  `SELECT * FROM users WHERE username = $1 AND email = $2`,
  [username, email]
);
const user=userDetails.rows[0];
if (!user) return res.status(404).json({ message: "username not found" });
   
const isMatch = await bcrypt.compare(password,user.password);
if (!isMatch) return res.status(401).json({ message: "Invalid password/Credentials" });
const token= jwt.sign(
    { id: user.id, username: user.username ,email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
);
    
  return res.json({ token }); 
} catch (error) {
    console.log("error logining",error);
    
if(error.code === "23505") {
    console.log("error logining in",error);
    return res.status(409).json({ message: "Username already exists" });

    }
return res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;