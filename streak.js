/**
 * @module streak
 * @description Manages the streak indicator GIF displayed in the score container
 * when the player answers multiple questions correctly in a row.
 */

/**
 * Shows or hides the streak animation GIF based on the current streak count.
 * A streak GIF is displayed when the streak is greater than 1; it is removed
 * when the streak drops to 1 or below (e.g., after a wrong answer or timeout).
 *
 * @param {number} streak - The current consecutive-correct-answer streak count.
 * @returns {void}
 */
export function streakImage(streak) {
  // Get the existing streak image element (if any)
  let currentStreak = document.getElementById("streak-image");

  if (streak > 1) {
    // Create and append the streak GIF to the score container
    const streakImg = document.createElement("img");
    streakImg.id = "streak-image";
    streakImg.alt = "You have a streak";
    streakImg.src = "Images/Streak.gif";
    const score_container = document.getElementById("score-container");
    score_container.appendChild(streakImg);
  } else {
    // Remove all streak images if the streak has ended
    if (currentStreak) {
      document.querySelectorAll("#streak-image").forEach(img => img.remove());
    }
  }
}
