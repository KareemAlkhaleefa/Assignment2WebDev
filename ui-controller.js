/**
 * @module ui-controller
 * @description Manages UI state updates and the per-question countdown timer.
 * Provides functions for updating the lives display, progress dots, and
 * running the 15-second question timer with a warning animation.
 */

/** @type {number|null} Active interval ID for the current question countdown timer. */
let timerInterval = null;

/**
 * Removes the last heart icon from the lives display.
 * Called each time the player loses a life.
 *
 * @returns {void}
 */
export function removeHeart() {
  const hearts = document.querySelectorAll(".heart");
  if (hearts.length > 0) {
    hearts[hearts.length - 1].remove();
  }
}

/**
 * Updates a progress dot to show whether the answer was correct or incorrect.
 *
 * @param {number} index - Zero-based index of the progress dot to update.
 * @param {boolean} correct - `true` to mark the dot green (correct answer),
 *   `false` to mark it red (wrong answer or timeout).
 * @returns {void}
 */
export function markDot(index, correct) {
  const dots = document.querySelectorAll(".progress-dot");
  if (dots[index]) {
    dots[index].classList.add(correct ? "correct" : "wrong");
  }
}

/**
 * Clears the active question countdown timer without triggering the timeout callback.
 * Should be called whenever an answer is selected or the question changes.
 *
 * @returns {void}
 */
export function clearTimer() {
  clearInterval(timerInterval);
}

/**
 * Starts a 15-second countdown timer for the current question.
 * Updates the on-screen timer display every second and adds a flashing
 * warning style when 5 or fewer seconds remain. Invokes `onTimeout`
 * when the countdown reaches zero.
 *
 * @param {Function} onTimeout - Callback invoked when the timer expires.
 *   The caller is responsible for deducting a life and advancing the game.
 * @returns {void}
 */
export function startTimer(onTimeout) {
  clearInterval(timerInterval);

  const timerElement = document.getElementById("timer");
  const timerContainer = document.getElementById("timer-container");
  let timeRemaining = 15;

  timerContainer.classList.remove("timer-warning");
  timerElement.textContent = timeRemaining;

  timerInterval = setInterval(() => {
    timeRemaining--;
    timerElement.textContent = timeRemaining;

    // Flash red warning when time is running low
    if (timeRemaining <= 5) {
      timerContainer.classList.add("timer-warning");
    }

    // Time's up: stop the interval and hand control back to the caller
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 1000);
}
