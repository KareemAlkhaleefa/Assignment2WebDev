export function streakImage(streak){

    //get ID for current Streak to see if it will be displayed
    let currentStreak = document.getElementById("streak-image");

    if(streak > 1){
        //Create image
        const streakImg = document.createElement("img");
        streakImg.id = "streak-image";
        streakImg.alt = "You have a streak";
        streakImg.src = "Images/Streak.gif";
        //Put the image into the score-container
        const score_container = document.getElementById("score-container");
        score_container.appendChild(streakImg);
    }
    else{
        //Delete the streak gif if streak < 2 and if it exsists
        if(currentStreak){
            //For each image that has been created with ID of streak-image DELETE/REMOVE
            document.querySelectorAll("#streak-image").forEach(img => img.remove());
        }
        
    }
}