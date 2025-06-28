const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

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

module.exports=router;