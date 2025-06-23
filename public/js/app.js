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
        setFavorites(recipe);

    });
    
} catch (error) {
    randomContainer.innerHTML=`<p>Error loading random recipe ${error.message}</p>`;
    console.error(error);

} 
} 
    }


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

    //search
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
        setFavorites(recipe);
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

    function setFavorites (recipe){
        let favorites =getFavorites();
        favorites.push(recipe);
        localStorage.setItem('favorites',JSON.stringify(favorites));
         displayFavorites();
    }
    const favoriteList = document.getElementById('favoriteList');
    function displayFavorites() {
        if (!favoriteList) {
            return;
        }
        const favorites = getFavorites();
        if (favorites.length === 0){
            favoriteList.innerHTML =`<p>No favorites recipes added yet.</p>`;
        }
        favorites.forEach(recipe => {
            const li = document.createElement('li');
            li.className="favoriteRecipe";
            li.innerHTML=`
            <h2>${recipe.title} </h2> 
             <img src="${recipe.image}" width="100">
        
            `;
            favoriteList.appendChild(li);
        });
    }
   
      const removeRecipes=document.getElementById('removeRecipes');
      if (removeRecipes)
        
    {
        removeRecipes.addEventListener('click',()=>{
            localStorage.removeItem('favorites');
            favoriteList.innerHTML = '';
            displayFavorites();
        });
    }

    
    function getFavorites() {
        const saved=localStorage.getItem('favorites');
        let favorites=[];
        if(saved) {
         favorites=JSON.parse(saved);   
        }
        return favorites;
    }
    displayFavorites();


