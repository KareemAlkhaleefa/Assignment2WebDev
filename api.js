/**
 * @module api
 * @description Handles all trivia data fetching from the Open Trivia Database API
 * with automatic fallback to a local JSON file when the API is unavailable.
 */

/**
 * Fetches trivia questions from the Open Trivia DB API.
 * Builds the request URL with optional category and difficulty filters.
 * Falls back to a local JSON file if the network request fails.
 *
 * @async
 * @param {string} categoryID - The numeric category ID to filter questions
 *   (pass an empty string for any category).
 * @param {string} difficulty - The difficulty level: `'easy'`, `'medium'`, `'hard'`,
 *   or an empty string for any difficulty.
 * @returns {Promise<{results: Array<Object>}>} Resolves to the API response object
 *   whose `results` property is an array of trivia question objects.
 */
export async function fetchData(categoryID, difficulty) {
  try {
    let apiUrl = `https://opentdb.com/api.php?amount=10&type=multiple`;
    if (categoryID) {
      apiUrl += `&category=${categoryID}`;
    }
    if (difficulty) {
      apiUrl += `&difficulty=${difficulty}`;
    }
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // If the API fails (rate limit, network error), load fallback questions
    console.error("API fetch failed, loading fallback questions:", error);
    const fallback = await fetch("triviaAPI.json");
    const data = await fallback.json();
    return data;
  }
}
