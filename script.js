let score = 0;
let lives = 3;
let questionIndex = 0;
let questions = [];
let buttonClicks = 0;
let startTime = Date.now();
let timerInterval;

/*Initialize the quiz, fetch the questions and answer from the api and call displayQuestionAndAnswers */
async function initQuiz() {
  document.getElementById("start-container").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  const data = await fetchData();
  questions = data.results;
  displayQuestionAndAnswers();
}
//should store data for our quiz questions and answers

async function fetchData() {
  try {
    const response = await fetch(
      "https://opentdb.com/api.php?amount=50&type=multiple",
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    //he.decode(data);
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function displayQuestionAndAnswers() {
  console.log(questions);
  //clear any existing timer intervals to prevent multiple timers from running at the same time
  clearInterval(timerInterval);

  var current_question = questions[questionIndex];
  var current_answers = [
    current_question.incorrect_answers,
    current_question.correct_answer,
  ];
  //needed to look this flat() method up to get one single array since concatenating wasnt working
  current_answers = current_answers.flat(Infinity);
  current_answers.sort(() => Math.random() - 0.5); // Shuffle the answers

  let question = document.querySelector(".question h2");
  let answerButtons = document.querySelectorAll(".answer-btn");

  //start the timer for the question
  startTimer();
  question.innerHTML = current_question.question;

  //loop through each answer button and add the text for the current questions answer and add an event for eve
  answerButtons.forEach((btn, index) => {
    var answerText = current_answers[index];
    btn.innerHTML = answerText;
    //on click if the answer is correct change the background color to green and turn off the buttons
    btn.onclick = () => {
      if (current_answers[index] === current_question.correct_answer) {
        clearInterval(timerInterval);
        btn.style.backgroundColor = "green";
        score = score + 10;
        document.querySelectorAll(".answer-btn").forEach((button) => {
          button.disabled = true;
        });
        document.getElementById("score").textContent = score;
        //we want to reset the button colors after 2 seconds and then go to the next question
        setTimeout(() => {
          document.querySelectorAll(".answer-btn").forEach((button) => {
            button.style.backgroundColor = "#007bff";
            button.disabled = false;
          });
          questionIndex++;
          clearInterval(timerInterval);
          displayQuestionAndAnswers();
        }, 2000);
      } else {
        //if the answer they select is wrong change the background color to red and turn off the buttons and take away a life
        document.querySelectorAll(".answer-btn").forEach((button) => {
          button.disabled = true;
        });
        clearInterval(timerInterval);
        btn.style.backgroundColor = "red";
        lives--;

        if (lives === 0) {
          btn.disabled = true;
          //stop the lives counter at 0;
          lives = 0;
          gameOver();
        }

        document.getElementById("lives").textContent = lives;
        //wait 2 seconds go to the next question reset the button colors and then go to the next question
        setTimeout(() => {
          document.querySelectorAll(".answer-btn").forEach((button) => {
            button.style.backgroundColor = "#007bff";
            button.disabled = false;
          });
          questionIndex++;
          clearInterval(timerInterval);
          displayQuestionAndAnswers();
        }, 2000);
      }
    };
  });
}

/*code implementing the end of the game and resetting the game when the player runs out of lives
      does not let user hit the buttons after the game is over */
function gameOver() {
  let answerButtons = document.querySelectorAll(".answer-btn");
  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });
  window.location.href = "endScreen.html";
}

/*Start the timer for each question at 15 seconds update time remaining dynamically
      If the user does not answer when time reaches 0 then decrement a life
      counter and go to the next question. If lives = 0  when the timer ends and decrements lives display the endGame screen */
function startTimer() {
  let startTime = Date.now();
  let timerElement = document.getElementById("timer");
  let timeRemaining = 15;
  timerInterval = setInterval(() => {
    timeRemaining--;
    timerElement.textContent = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      lives--;
      document.getElementById("lives").textContent = lives;
      questionIndex++;
      displayQuestionAndAnswers();
    }
    if (lives === 0) {
      gameOver();
    }
  }, 1000);
}