//Random
const randomContainer = document.getElementById('Random-section');
    if(randomContainer){
    randomContainer.innerHTML = `
    <h2>Get Random Recipe</h2> 
    <button id="getRandomBtn">Generate Random Recipe</button>
     <div id="randomRecipeContainer"></div>
    `
const getRandomBtn = document.getElementById('getRandomBtn');
const randomRecipeContainer=document.getElementById('randomRecipeContainer');
getRandomBtn.addEventListener('click',FetchRandom);
async function FetchRandom() {
    try {
    const response = await fetch('/api/recipes/random');
    if (!response.ok) {
        throw new Error("HTTP response was unsuccessful.");  
    }
    const randomData = await response.json();
    const recipe = randomData.recipes[0];

    randomRecipeContainer.innerHTML = `
     <h2>${recipe.title} </h2> 
    <img src="${recipe.image}" width="200">
    <p><strong>Instructions:</strong>${recipe.instructions} </p> 
    <p><strong>Ingredients:</strong> </p>
    <ul>${recipe.extendedIngredients.map(item =>`<li>${item.original}</li>`).join('')}</ul>
    <button
    class ="saveBtn"
    data-id="${recipe.id}" 
  data-title="${recipe.title}" 
  data-img="${recipe.image}">
        Save to Favorites</button>
    `;
    //saveBTn
    const saveBtn=randomContainer.querySelector('.saveBtn');
    saveBtn.addEventListener ('click',()=>{
         AddFavorites(recipe);

    });
    
} catch (error) {
    randomContainer.innerHTML=`<p>Error loading random recipe ${error.message}</p>`;
    console.error(error);

} 
} 
    }

//search
const searchContainer =document.getElementById('Search-section');

if (searchContainer) {
    const searchbtn =document.getElementById('searchBtn');
    const input = document.getElementById('ingrediants-input');
async function FetchSearch(ingredients) {
    try {
        const response = await fetch (`/api/recipes/search?ingredients=${encodeURIComponent(ingredients)}`);
    if (!response.ok) {
         throw new Error("HTTP response was unsuccessful.");
    }

    
    const searchResult = await response.json();
    console.log('searchResult:', searchResult);
    
        const recipeList = searchResult; 

    if (!recipeList || recipeList.length === 0){
searchContainer.innerHTML=`<p>No recipes found for ${ingredients} try other ingredients</p> `;
        return;
    }
        const recipe = recipeList[0];
        console.log('recipe',recipe);
        
        if (!recipe || !recipe.title) {
  searchContainer.innerHTML = `<p>Invalid recipe data received.</p>`;
  return;
}
    const usedIngredients = recipe.usedIngredients || [];
const missedIngredients = recipe.missedIngredients || [];
console.log('usedIngredients',usedIngredients);
console.log('missedIngredients',missedIngredients);


    searchContainer.innerHTML= `
     <h2>${recipe.title} </h2> 
    <img src="${recipe.image}" width="200">
    <p><strong>usedIngredients:</strong> </p> 
    
    <ul>${usedIngredients.map(item =>`<li>${item.name}</li>`).join('')}</ul>

    <p><strong>missedIngredients:</strong> </p>
    <ul>${missedIngredients.map(item =>`<li>${item.name}</li>`).join('')}</ul>
    <button class ="saveBtn"
    data-id="${recipe.id}" 
  data-title="${recipe.title}" 
  data-img="${recipe.image}">
        Save to Favorites</button>
    `;
        //saveBTn
    const saveBtn=searchContainer.querySelector('.saveBtn');
    saveBtn.addEventListener ('click',()=>{
        AddFavorites(recipe);
    });

    } catch (error) {
        searchContainer.innerHTML=`<p>Error loading the result of your search ${error.message}</p>`;
      console.error(error);
      
    }
    }

    searchbtn.addEventListener ('click',()=>{
        const ingrediants=input.value.trim();
        if (!ingrediants) {
            searchContainer.innerHTML = `<p>Please enter ingrediants to search</p> `;
            return;
        }
    FetchSearch(ingrediants);
    });
    
    }
//-----------------------------------------------------------
    // Display
    const favoriteList = document.getElementById('favoriteList');
    async function displayFavorites() {
        if (!favoriteList) {
            return;
        }
        const favorites = await getFavorites();
        favoriteList.innerHTML= '';
        if (favorites.length === 0){
            favoriteList.innerHTML =`<p>No favorites recipes added yet.</p>`;
        }
        favorites.forEach(recipe => {
            const li = document.createElement('li');
            li.className="favoriteRecipe";
            li.innerHTML=`
             <h2>${recipe.title} </h2> 
             <img src="${recipe.image}" width="100">
             <p><strong>Instructions: </strong>${recipe.instructions} </p>
             <p><strong>Ingredients: </strong>${recipe.ingredients= Array.isArray(recipe.ingredients)?recipe.ingredients.join(', '): 'N/A'} </p>
             <p><strong>Ready in: </strong>${recipe.readyin} minutes</p>
                 <a href="editRecipe.html?id=${recipe.id}"><button>Update</button></a>
             <button onclick="deleteRecipe(${recipe.id})">Delete</button>

            `;
            favoriteList.appendChild(li);
        });
    }
   //CLearAll btn
      const removeRecipes=document.getElementById('removeRecipes');
      if (removeRecipes){
        removeRecipes.addEventListener('click',async () => {
    try {
        const response= await fetch('/api/recipes/deleteAll',{
            method: 'DELETE'
        });
        if(!response.ok){
        throw new Error("Failed to remove all recipes from the server");
        }
        await response.json();
        await displayFavorites();

    } catch (error) { 
        console.log('error removing all recipes',error);
    
    }   
        });
    }
    //deleteRecipe
    async function deleteRecipe(id) {
        try {
            const response= await fetch(`/api/recipes/delete/${id}`,{
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error("Failed to delete the recipe");
            
        }
        await response.json();
        await displayFavorites();
        } catch (error) {
            console.log(`Error removing the recipe ${id}`,error);
            
        }
    }
    //GET functionality
   
   async function getFavorites() {
    try {
        const response= await fetch('api/recipes/all');
        if(!response.ok){
        throw new Error("Failed to fetch favorites");
        }
        const data =await response.json();
        return data;
    } catch (error) { 
        console.log('error getting favorites',error);
        return [];
    }
    }

    // Post functionality 

    async function AddFavorites(recipe) {
        try {
            recipe.ingrediants= Array.isArray(recipe.ingrediants)
            ? recipe.ingrediants
            : (recipe.ingrediants || '').split(',').map(i=>i.trim());

            const response = await fetch('api/recipes/insert',{
                 method: 'POST',
                 headers: {
                'Content-Type': 'application/json'
                 },
                  body: JSON.stringify(recipe)
         });
        
        if (!response.ok) {
            throw new Error("Failed to Post favorite recipe");
        }
            const data =await response.json();
        
        displayFavorites();
        return data;

        } catch (error) {
            console.log('Error adding new recipe', error);   
        }
    }
    
    // insertForm
    const insertRecipe = document.getElementById('insertRecipe');
if(insertRecipe){
    insertRecipe.innerHTML= `
    <h2> Bring your best recipe to the Flavor Table! </h2> 
    <form>
     <label>Title:<input type="text" name="title" class="cell"></label><br>
     <label>Image URL: <input type="url" name="image" class="cell"></label><br>
     <label>Instructions: <textarea name="instructions" class="cell"></textarea></label><br>
     <label>Ingredients(comma seperated) <input type="text" name="ingredients" class="cell"></label><br>
     <label> Ready In (minutes) <input type="number" name="readyin" class="cell"></label><br>
     <button type="submit" id="submitBtn">Add Recipe</button>
     </form>
     `;
       const form = insertRecipe.querySelector('form');
        if (!form){
    console.log('Form was not found inside insertRecipe ');
        }
       
    form.addEventListener('submit',async (e)=>{ try {
        e.preventDefault();
        console.log('Form submitted!',e);
        const formData = new FormData(form);
        const newRecipe= {
            title: formData.get('title'),
            image: formData.get('image'),
            instructions: formData.get('instructions'),
            ingredients: formData.get('ingredients').split(',').map(item => item.trim()),
            readyIn: formData.get('readyin')
        }
         await AddFavorites(newRecipe);
         await displayFavorites();
         form.reset();
         
       
    } catch (error) {
        console.log('Error Add new recipe',error.message);
 
    }
    });
 }
     displayFavorites();
 // Put functionality 
    async function UpdateFavorites(recipe) {
        try {
            const response = await fetch(`api/recipes/update/${recipe.id}`,{
                 method: 'PUT',
                 headers: {
                'Content-Type': 'application/json'
                 },
                  body: JSON.stringify(recipe)
         });
        if (!response.ok) {
            throw new Error("Failed to Update the favorite recipe");
        }
            const data =await response.json();
        
        displayFavorites();
        return data;

        } catch (error) {
            console.log('Error Updating new recipe', error);   
        }
    }

    const updateRecipeForm= document.getElementById('updateRecipe');
 if (updateRecipeForm) {

 //Grapping id from URL
 const params =new URLSearchParams(window.location.search);
 const id = params.get('id');
 if(!id) {
    updateRecipeForm.innerHTML= '<p>No id Recipe found in URL</p> ';
    
        }
    async function loadRecipeData(id) {
       try {
        const response= await fetch(`api/recipes/${id}`);
        if (!response.ok) {
            throw new Error("Error fetching recipe");
            
        }
        const recipe= await response.json();
        // get value of each element inside the form
        updateRecipeForm.elements['title'].value=recipe.title || '';
        updateRecipeForm.elements['image'].value=recipe.image || '';
        updateRecipeForm.elements['instructions'].value=recipe.instructions || '';
        updateRecipeForm.elements['ingredients'].value = Array.isArray(recipe.ingredients)
        ?recipe.ingredients.join(', ') 
        : recipe.ingredients || '';
        updateRecipeForm.elements['readyin'].value=recipe.readyin || '';
       
    } catch (error) {
        console.log("Error loading recipe".error);
        updateRecipeForm.innerHTML='<p>Erorr loading recipe data</p>';
       }
           }
           loadRecipeData(id);
         }
    
    updateRecipeForm.addEventListener('submit',async(e)=>{
        e.preventDefault();
        const updatedRecipe = {
            id: id,
            title: updateRecipeForm.elements['title'].value,
            image: updateRecipeForm.elements['image'].value,
            instructions: updateRecipeForm.elements['instructions'].value,
            ingredients: updateRecipeForm.elements['ingredients'].value,
            readyin: updateRecipeForm.elements['readyin'].value,
        };

        const result = await UpdateFavorites(updatedRecipe);
        if (result) {
            alert("Recipe updated successfully!");
        }
    });
