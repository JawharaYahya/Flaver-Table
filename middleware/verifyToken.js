const jwt = require("jsonwebtoken");
require("dotenv").config();

//next parameter used in the middleWare only, to continue the process, call it at the end of the function
function routeGuard(req,res,next) {
    const authHeader = req.headers["authorization"];

    const tokenFromHeader = authHeader && authHeader.split(" ")[1]; //check if authHeader is exist EXTRACT and split the token
      const tokenFromQuery = req.query.token;

    const token = tokenFromHeader || tokenFromQuery;
      console.log("=== TOKEN DEBUG START ===");
    console.log("authHeader:", authHeader);
    console.log("Extracted Token:", token);

    if(!token) return res.status(401).send("No token provided, Access Denied");
    try {
        const decode= jwt.verify(token,process.env.JWT_SECRET);
        req.user= decode;
        next(); //to start wih the next middleware
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token", error: error.message });

    }
}
//routeGuard have to be used anywhere we need to protect it's route
module.exports=routeGuard;