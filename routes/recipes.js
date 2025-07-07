const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const routeGuard=require("../middleware/verifyToken");
//Random recipe route
router.get('/random',async (req,res)=>{
try {
     const response = await axios.get(`https://api.spoonacular.com/recipes/random?apiKey=${process.env.API_KEY}`);


      res.json(response.data);
      console.log(response.data);
   
}catch (error) {
    console.log('Error fetching random recipes', error.message);
    res.status(500).json({ error: 'Failed to fetch random recipe' });
  }
  });

//Search route
router.get('/search',async (req,res)=>{
try {
        const ingredients = req.query.ingredients;
        if (!ingredients){
            return res.status(400).json({error:"please provide ingredients"});
        }
        const number =5;
const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${number}&apiKey=${process.env.API_KEY}`);
       console.log('Ingredients used for search:', ingredients);
    res.json(response.data);

} catch (error) {
    console.log('search error',error.message);  
    res.status(500).json({error:'search recipes failed'});
}
});

// GET 
router.get("/all",routeGuard, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");
    res.json(result.rows);
  } catch (error) {
    console.log("error showing the data", error);

    res.status(500).send("Error fetching");
  }
});
// GET single recipe byID
router.get("/:id", async (req, res) => {
  try {
   const { id } = req.params;
const result = await pool.query("SELECT * FROM recipes WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Recipe Not Found');
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.log("error fetching recipe by id", error);

    res.status(500).send("server error");
  }
});

//POST insert data into the table

router.post("/insert", async (req, res) => {
  const { title, image, instructions, ingredients, readyin} = req.body;

  try {
    const ingredientsJSON= JSON.stringify(ingredients);
    const result = await pool.query(
      `INSERT INTO recipes (title, image, instructions, ingredients,readyin) VALUES ($1, $2, $3, $4, $5 ) RETURNING *`,
      [title, image, instructions, ingredientsJSON, readyin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("error inserting", error);
    res.status(500).send("Error");
  }
});

//PUT update the recipe by ID

router.put("/update/:id",routeGuard, async (req, res) => {
  const { id } = req.params;
  const {title, image, instructions, ingredients, readyin} = req.body;

  try {
    const result = await pool.query(
      "UPDATE recipes SET title=$1, image=$2, instructions=$3, ingredients=$4, readyin=$5 WHERE id=$6 RETURNING *",
      [title, image, instructions, JSON.stringify(ingredients), readyin, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log("error Updating recipe",error.message);
    
    res.status(500).send("Error");
  }
});
//DELETE All
router.delete("/deleteAll", async (req, res) => {
  try {
    const result = await pool.query( "DELETE FROM recipes" );
    res.json({messeage:"All Recipes deleted successfully"});
  } catch (error) {
    console.log("error Deleting all recipes",error);
    res.status(500).send("Error Deleting all recipes");
  }
});
// DELETE one recipe
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );
    if(result.rowCount === 0){
      return res.status(404).json({message: "Recipe Not Found"});
    }
    res.json({messeage:"Recipe deleted successfully", deleted: result.rows[0]});
  } catch (error) {
    console.log("error Deleting recipe",error);
    
    res.status(500).send("Error");
  }
});


module.exports=router;