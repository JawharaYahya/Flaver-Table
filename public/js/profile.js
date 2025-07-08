const profileInfo= document.getElementById("profileInfo");
async function fetchProfile() {
    const token=localStorage.getItem("token");
    if(!token){
        profileInfo.innerHTML=`Not logged in`;
        return;
    }
    try {
        const response= await fetch("http://localhost:4321/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(!response.ok){
        throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    const profile= await response.json();
    profileInfo.innerHTML=`
    <h2>your profile Info</h2>
    <p><strong>Username:</strong> ${profile.username}</p>
    <p><strong>Email:</strong> ${profile.email}</p>
    `;
    } catch (error) {
         profileInfo.innerHTML=`Error loading profile`;
        console.log("Error loading profile",error)
    }
} 
    
    fetchProfile();