let score = 0;
let currentStreak = 0;
let highestStreak = 0;
let questionsAttempted = 0;
let correctAnswers = 0;
let currentQuestion = {};
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit-btn');
const newBtn = document.getElementById('new-btn');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const feedbackElement = document.getElementById('feedback');
const progressBar = document.getElementById('progress');
const attemptedElement = document.getElementById('attempted');
const correctElement = document.getElementById('correct');
const accuracyElement = document.getElementById('accuracy');
const highestStreakElement = document.getElementById('highest-streak');

document.addEventListener('DOMContentLoaded', () => {
    generateQuestion();

    submitBtn.addEventListener('click', checkAnswer);
    newBtn.addEventListener('click', generateQuestion);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
});

function generateQuestion() {
    feedbackElement.textContent = '';
    answerInput.value = '';
    answerInput.focus();

    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2;
    const difficulty = Math.min(10 + Math.floor(currentStreak / 3), 50);

    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * difficulty) + 1;
            num2 = Math.floor(Math.random() * difficulty) + 1;
            break;
        case '-':
            num1 = Math.floor(Math.random() * difficulty) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            break;
        case '*':
            num1 = Math.floor(Math.random() * Math.sqrt(difficulty)) + 1;
            num2 = Math.floor(Math.random() * Math.sqrt(difficulty)) + 1;
            break;
        case '/':
            num2 = Math.floor(Math.random() * Math.sqrt(difficulty)) + 1;
            const multiplier = Math.floor(Math.random() * Math.sqrt(difficulty)) + 1;
            num1 = num2 * multiplier;
            break;
    }

    currentQuestion = {
        num1: num1,
        num2: num2,
        operation: operation,
        answer: eval(`${num1} ${operation} ${num2}`)
    };

    if (operation === '/' && currentQuestion.answer % 1 !== 0) {
        currentQuestion.answer = parseFloat(currentQuestion.answer.toFixed(2));
    }

    questionElement.textContent = `${num1} ${operation} ${num2} = ?`;

    progressBar.style.width = '0%';
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 10);
}

function checkAnswer() {
    const userAnswer = parseFloat(answerInput.value);

    if (isNaN(userAnswer)) {
        feedbackElement.textContent = 'Please enter a valid number!';
        feedbackElement.className = 'text-red-500 font-medium';
        return;
    }

    questionsAttempted++;
    attemptedElement.textContent = questionsAttempted;

    if (Math.abs(userAnswer - currentQuestion.answer) < 0.001) {
        score += 10 + Math.floor(currentStreak / 2);
        currentStreak++;
        correctAnswers++;

        if (currentStreak > highestStreak) {
            highestStreak = currentStreak;
            highestStreakElement.textContent = highestStreak;
        }

        feedbackElement.textContent = 'Correct! 🎉';
        feedbackElement.className = 'text-green-500 font-bold';
        questionElement.classList.add('correct-answer');

        setTimeout(() => {
            questionElement.classList.remove('correct-answer');
        }, 500);
    } else {
        currentStreak = 0;
        feedbackElement.textContent = `Oops! The correct answer was ${currentQuestion.answer}`;
        feedbackElement.className = 'text-red-500 font-medium';
        questionElement.classList.add('wrong-answer');

        setTimeout(() => {
            questionElement.classList.remove('wrong-answer');
        }, 500);
    }

    scoreElement.textContent = score;
    streakElement.textContent = currentStreak;
    correctElement.textContent = correctAnswers;
    accuracyElement.textContent = Math.round((correctAnswers / questionsAttempted) * 100) + '%';

    setTimeout(generateQuestion, 1500);
}