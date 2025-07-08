require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
//import routes
const homeRoute = require('./routes/home');
const recipeRoute = require('./routes/recipes');
const auth =require('./routes/auth');

 
//Middleware
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.json());


//routes ,the path between '' will be before each path inside recipeRoute
app.use('/',homeRoute);
app.use('/api/recipes',recipeRoute);
app.use('/user',auth);

//404 handler
app.use((req,res)=> {
res.status(404).send('Page not found <a href="/">Get Back Home</a>');
});

//start server
const PORT = process.env.PORT || 3000;
pool.connect()
  .then(() => {
app.listen(PORT,()=>{
console.log(`Server running on  http://localhost:${PORT}`)
});
  })
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err);
  });