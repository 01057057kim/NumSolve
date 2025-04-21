let score = 0;
let currentStreak = 0;
let highestStreak = 0;
let questionsAttempted = 0;
let correctAnswers = 0;
let currentQuestion = {};
let timeRemaining = 30;
let maxTime = 60;
let timerInterval;
let timerStarted = false;
let gameOver = false;
let currentStage = 1;
let stageThresholds = [0, 20, 50, 80, 140, 250, 400, 680, 970, 1350, 2000];
let newButtonCooldown = false;
let cooldownDuration = 5; 
let cooldownRemaining = 0;
let cooldownInterval;

const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit-btn');
const newBtn = document.getElementById('new-btn')
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const feedbackElement = document.getElementById('feedback');
const attemptedElement = document.getElementById('attempted')
const correctElement = document.getElementById('correct');
const accuracyElement = document.getElementById('accuracy');
const highestStreakElement = document.getElementById('highest-streak');


newBtn.addEventListener('click', () => {
    if (gameOver) {
        resetGame();
    } else if (!newButtonCooldown) {
        startNewButtonCooldown();
        generateQuestion();
    }
});
function startNewButtonCooldown() {
    newButtonCooldown = true;
    cooldownRemaining = cooldownDuration;

    newBtn.disabled = true;
    newBtn.classList.add('opacity-50', 'cursor-not-allowed');

    updateCooldownDisplay();

    cooldownInterval = setInterval(() => {
        cooldownRemaining--;
        updateCooldownDisplay();

        if (cooldownRemaining <= 0) {
            clearInterval(cooldownInterval);
            newButtonCooldown = false;
            newBtn.disabled = false;
            newBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            newBtn.innerHTML = 'New Question <i class="fas fa-redo ml-2"></i>';
        }
    }, 1000);
}
function updateCooldownDisplay() {
    newBtn.innerHTML = `New Question (${cooldownRemaining}s) <i class="fas fa-hourglass-half ml-2"></i>`;
}
function resetGame() {
    if (newButtonCooldown) {
        clearInterval(cooldownInterval);
        newButtonCooldown = false;
    }

    score = 0;
    currentStreak = 0;
    highestStreak = 0;
    questionsAttempted = 0;
    correctAnswers = 0;
    timeRemaining = 30;
    timerStarted = false;
    gameOver = false;
    currentStage = 1;

    scoreElement.textContent = score;
    streakElement.textContent = currentStreak;
    attemptedElement.textContent = questionsAttempted;
    correctElement.textContent = correctAnswers;
    accuracyElement.textContent = '0%';
    highestStreakElement.textContent = highestStreak;
    document.getElementById('current-stage').textContent = currentStage;

    newBtn.innerHTML = 'New Question <i class="fas fa-redo ml-2"></i>';
    newBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'opacity-50', 'cursor-not-allowed');
    newBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
    newBtn.disabled = false;
    answerInput.disabled = false;
    submitBtn.disabled = false;

    generateQuestion();
}

function checkStageProgression() {
    const prevStage = currentStage;
    
    for (let i = stageThresholds.length - 1; i >= 0; i--) {
        if (score >= stageThresholds[i]) {
            currentStage = i + 1;
            break;
        }
    }
    
    if (currentStage > prevStage) {
        const stageUpNotification = document.createElement('div');
        
        if (currentStage === 11) {
            document.body.classList.add('stage-11-active');
            
            stageUpNotification.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 bg-red-700 text-white px-8 py-4 rounded-lg shadow-xl z-50 animate-pulse text-lg font-bold';
            stageUpNotification.innerHTML = `⚠️ IMPOSSIBLE MODE UNLOCKED ⚠️<br>Stage 11 Activated!`;
            
            const gameContainer = document.querySelector('.container');
            gameContainer.classList.add('shake');
            setTimeout(() => gameContainer.classList.remove('shake'), 1000);
            
        } else {
            stageUpNotification.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
            stageUpNotification.textContent = `Stage Up! Now at Stage ${currentStage}`;
        }
        
        document.body.appendChild(stageUpNotification);
        document.getElementById('current-stage').textContent = currentStage;
        
        setTimeout(() => {
            stageUpNotification.remove();
        }, 3000);
    }
}

function generateQuestion() {
    if (gameOver) return;

    feedbackElement.textContent = '';
    answerInput.value = '';
    answerInput.focus();

    checkStageProgression();

    switch (currentStage) {
        case 1: // Very Easy - simple addition/subtraction with small numbers
            generateStage1Question();
            break;
        case 2: // Easy - addition/subtraction with slightly larger numbers
            generateStage2Question();
            break;
        case 3: // Basic multiplication and division
            generateStage3Question();
            break;
        case 4: // Two operations with small numbers
            generateStage4Question();
            break;
        case 5: // Mixed operations with larger numbers
            generateStage5Question();
            break;
        case 6: // Three operations with order of operations
            generateStage6Question();
            break;
        case 7: // Complex expressions with parentheses
            generateStage7Question();
            break;
        case 8: // Challenging operations including powers
            generateStage8Question();
            break;
        case 9: // Advanced expressions with multiple parentheses
            generateStage9Question();
            break;
        case 10: // Expert level with powers, roots, and complex operations
            generateStage10Question();
            break;
        case 11: // IMPOSSIBLE level - extremely hard calculations
            generateStage11Question();
            break;
    }

    if (timerStarted) {
        clearInterval(timerInterval);
        startTimer();
    } else {
        updateTimerDisplay();
    }
}
// Stage 1: Very Easy - simple addition/subtraction with small numbers
function generateStage1Question() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2;

    if (operation === '+') {
        num1 = Math.floor(Math.random() * 15) + 1; // 1-15
        num2 = Math.floor(Math.random() * 15) + 1; // 1-15
    } else { // Subtraction
        num1 = Math.floor(Math.random() * 15) + 1; // 1-15
        num2 = Math.floor(Math.random() * num1) + 1; 
    }

    currentQuestion = { 
        expression: `${num1} ${operation} ${num2}`,
        answer: eval(`${num1} ${operation} ${num2}`)
    };

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 2:  Easy - aaddition/subtraction with slightly larger numbers
function generateStage2Question() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2;

    if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 10; // 1-50
        num2 = Math.floor(Math.random() * 50) + 10; // 1-50
    } else { // Subtraction
        num1 = Math.floor(Math.random() * 25) + 10; // 1-25
        num2 = Math.floor(Math.random() * num1) + 1; 
    }

    currentQuestion = {
        expression: `${num1} ${operation} ${num2}`,
        answer: eval(`${num1} ${operation} ${num2}`)
    };

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 3: Basic multiplication and division
function generateStage3Question() {
    const questionType = Math.random();

    if (questionType < 0.6) { // Multiplication
        const num1 = Math.floor(Math.random() * 10) + 2; // 2-10
        const num2 = Math.floor(Math.random() * 10) + 2; // 2-10

        currentQuestion = {
            expression: `${num1} * ${num2}`,
            answer: num1 * num2
        };
    } else { // Division with whole number results
        const divisor = Math.floor(Math.random() * 10) + 2; // 2-10
        const multiplier = Math.floor(Math.random() * 10) + 1; // 1-10
        const dividend = divisor * multiplier; // Guarantees whole number result

        currentQuestion = {
            expression: `${dividend} / ${divisor}`,
            answer: multiplier
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 4: Two operations with small numbers
function generateStage4Question() {
    const ops = ['+', '-'];
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];

    let num1 = Math.floor(Math.random() * 15) + 1; // 1-15
    let num2 = Math.floor(Math.random() * 15) + 1; // 1-15
    let num3 = Math.floor(Math.random() * 15) + 1; // 1-15

    // Reorder numbers to avoid negative results for subtractions
    if (op1 === '-' && num2 > num1) {
        [num1, num2] = [num2, num1];
    }

    // For second operation, check if we need to reorder
    let tempResult = eval(`${num1} ${op1} ${num2}`);
    if (op2 === '-' && num3 > tempResult) {
        // If get a negative, switch to addition
        const expression = `${num1} ${op1} ${num2} + ${num3}`;
        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    } else {
        const expression = `${num1} ${op1} ${num2} ${op2} ${num3}`;
        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 5: Mixed operations with larger numbers
function generateStage5Question() {
    const operations = ['+', '-', '*'];
    const questionType = Math.random();

    if (questionType < 0.5) { // Single operation with larger numbers
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let num1, num2;

        if (operation === '+' || operation === '-') {
            num1 = Math.floor(Math.random() * 20) + 5; // 5-29
            num2 = Math.floor(Math.random() * 20) + 5; // 5-29

            if (operation === '-' && num2 > num1) {
                [num1, num2] = [num2, num1]; // Swap to ensure positive result
            }
        } else { // Multiplication
            num1 = Math.floor(Math.random() * 19) + 5; // 5-12
            num2 = Math.floor(Math.random() * 19) + 5; // 5-12
        }

        currentQuestion = {
            expression: `${num1} ${operation} ${num2}`,
            answer: eval(`${num1} ${operation} ${num2}`)
        };
    } else { // Mix addition/subtraction with multiplication
        const num1 = Math.floor(Math.random() * 29) + 9; // 2-11
        const num2 = Math.floor(Math.random() * 29) + 9; // 2-11
        const num3 = Math.floor(Math.random() * 16) + 6;  // 2-6

        // Use addition and multiplication to ensure positive result
        const expression = Math.random() < 0.5 ?
            `${num1} + ${num2} * ${num3}` :
            `${num1} * ${num2} + ${num3}`;

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 6: Three operations with order of operations
function generateStage6Question() {
    const operations = ['+', '-', '*'];

    // Create a three-operation expression
    const op1 = operations[Math.floor(Math.random() * operations.length)];
    const op2 = operations[Math.floor(Math.random() * operations.length)];
    const op3 = operations[Math.floor(Math.random() * operations.length)];

    let num1 = Math.floor(Math.random() * 15) + 5; // 5-19
    let num2 = Math.floor(Math.random() * 10) + 2; // 2-11
    let num3 = Math.floor(Math.random() * 10) + 2; // 2-11
    let num4 = Math.floor(Math.random() * 8) + 2;  // 2-9

    // Ensure we don't get negative numbers with careful ordering
    if (op1 === '-' && num2 > num1) [num1, num2] = [num2, num1];

    // Build expression incrementally to check for negatives
    let expression = `${num1} ${op1} ${num2}`;
    let tempResult = eval(expression);

    if (op2 === '-' && tempResult < num3) {
        // If we'd get a negative, switch to addition
        expression = `${expression} + ${num3}`;
        tempResult = eval(expression);
    } else {
        expression = `${expression} ${op2} ${num3}`;
        tempResult = eval(expression);
    }

    if (op3 === '-' && tempResult < num4) {
        // If we'd get a negative, switch to addition
        expression = `${expression} + ${num4}`;
    } else {
        expression = `${expression} ${op3} ${num4}`;
    }

    currentQuestion = {
        expression: expression,
        answer: eval(expression)
    };

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 7: Complex expressions with parentheses
function generateStage7Question() {
    const operations = ['+', '-', '*'];
    const questionType = Math.random();

    if (questionType < 0.6) {
        // Parentheses with two operations
        const op1 = operations[Math.floor(Math.random() * operations.length)];
        const op2 = operations[Math.floor(Math.random() * operations.length)];

        let num1 = Math.floor(Math.random() * 15) + 5; // 5-19
        let num2 = Math.floor(Math.random() * 10) + 2; // 2-11
        let num3 = Math.floor(Math.random() * 10) + 2; // 2-11

        // Ensure no negative results for subtraction within parentheses
        if (op1 === '-' && num2 > num1) [num1, num2] = [num2, num1];

        // Create expression with parentheses
        let expression = `(${num1} ${op1} ${num2}) ${op2} ${num3}`;
        let tempResult = eval(expression);

        // If result is negative, adjust
        if (tempResult < 0) {
            if (op2 === '-') {
                expression = `(${num1} ${op1} ${num2}) + ${num3}`;
            } else if (op2 === '*') {
                // For multiplication with negative, just swap the order
                expression = `${num3} ${op2} (${num1} ${op1} ${num2})`;
            }
        }

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    } else {
        // Number outside affecting parentheses
        const op1 = operations[Math.floor(Math.random() * operations.length)];
        const op2 = operations[Math.floor(Math.random() * operations.length)];

        let num1 = Math.floor(Math.random() * 10) + 2; // 2-11
        let num2 = Math.floor(Math.random() * 12) + 3; // 3-14
        let num3 = Math.floor(Math.random() * 10) + 2; // 2-11

        if (op1 === '-' && num2 > num1) [num1, num2] = [num2, num1];

        // Create expression with number outside parentheses
        let expression = `${num1} ${op2} (${num2} ${op1} ${num3})`;

        // Check for negative results and adjust if needed
        try {
            const result = eval(expression);
            if (result < 0 && op2 === '*') {
                // If negative result with multiplication, swap for simplicity
                expression = `(${num2} ${op1} ${num3}) ${op2} ${num1}`;
            } else if (result < 0) {
                // For other operations with negative result, switch to addition
                expression = `${num1} + (${num2} ${op1} ${num3})`;
            }
        } catch (e) {
            // Fallback if there's any evaluation error
            expression = `${num1} + (${num2} + ${num3})`;
        }

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 8: Challenging operations including powers
function generateStage8Question() {
    const questionType = Math.random();

    if (questionType < 0.4) {
        // Simple exponent questions
        const base = Math.floor(Math.random() * 5) + 2; // 2-6
        const power = Math.floor(Math.random() * 2) + 2; // 2-3

        currentQuestion = {
            expression: `${base}^${power}`,
            answer: Math.pow(base, power)
        };
    } else if (questionType < 0.7) {
        // Exponent with operation
        const base = Math.floor(Math.random() * 4) + 2; // 2-5
        const power = 2; // Square for simplicity
        const num2 = Math.floor(Math.random() * 15) + 5; // 5-19

        // Use addition to ensure positive result
        const expression = `${base}^${power} + ${num2}`;

        currentQuestion = {
            expression: expression,
            answer: Math.pow(base, power) + num2
        };
    } else {
        // More complex expression with division and multiplication
        const divisor = Math.floor(Math.random() * 5) + 2; // 2-6
        const multiplier = Math.floor(Math.random() * 5) + 2; // 2-6
        const dividend = divisor * multiplier; // Guarantees whole number result

        const num1 = Math.floor(Math.random() * 10) + 5; // 5-14

        // Create expression with division that results in whole number
        const expression = `${num1} * (${dividend} / ${divisor})`;

        currentQuestion = {
            expression: expression,
            answer: num1 * multiplier
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 9: Advanced expressions with multiple parentheses
function generateStage9Question() {
    const questionType = Math.random();

    if (questionType < 0.5) {
        // Nested parentheses
        const num1 = Math.floor(Math.random() * 8) + 2; // 2-9
        const num2 = Math.floor(Math.random() * 6) + 2; // 2-7
        const num3 = Math.floor(Math.random() * 5) + 1; // 1-5
        const num4 = Math.floor(Math.random() * 5) + 1; // 1-5

        // Create nested parentheses expression
        const expression = `(${num1} * (${num2} + ${num3})) + ${num4}`;

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    } else {
        // Multiple separate parentheses
        const num1 = Math.floor(Math.random() * 8) + 2; // 2-9
        const num2 = Math.floor(Math.random() * 6) + 2; // 2-7
        const num3 = Math.floor(Math.random() * 5) + 1; // 1-5
        const num4 = Math.floor(Math.random() * 5) + 1; // 1-5

        // Operations between parenthetical groups
        const operations = ['+', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        // Create expression with multiple parentheses
        const expression = `(${num1} + ${num2}) ${operation} (${num3} + ${num4})`;

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 10: Expert level with powers, roots, and complex operations
function generateStage10Question() {
    const questionType = Math.random();

    if (questionType < 0.33) {
        // Complex expression with exponents and operations
        const base1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const power1 = Math.floor(Math.random() * 2) + 2; // 2-3
        const base2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const power2 = 2; // Square for simplicity

        // Use addition between powers
        const expression = `${base1}^${power1} + ${base2}^${power2}`;

        currentQuestion = {
            expression: expression,
            answer: Math.pow(base1, power1) + Math.pow(base2, power2)
        };
    } else if (questionType < 0.66) {
        // Exponent inside parentheses with operation
        const base = Math.floor(Math.random() * 3) + 2; // 2-4
        const power = 2; // Square for simplicity
        const num1 = Math.floor(Math.random() * 10) + 5; // 5-14
        const num2 = Math.floor(Math.random() * 5) + 2; // 2-6

        // Create expression with exponent inside parentheses
        const expression = `${num1} * (${base}^${power} + ${num2})`;

        currentQuestion = {
            expression: expression,
            answer: num1 * (Math.pow(base, power) + num2)
        };
    } else {
        // Complex expression with multiple operations and parentheses
        const num1 = Math.floor(Math.random() * 8) + 3; // 3-10
        const num2 = Math.floor(Math.random() * 5) + 2; // 2-6
        const num3 = Math.floor(Math.random() * 4) + 2; // 2-5
        const num4 = Math.floor(Math.random() * 3) + 2; // 2-4

        // Create multi-operation expression with careful sequencing to ensure whole numbers
        const expression = `(${num1} * ${num2}) + (${num3} * ${num4})`;

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 11: IMPOSSIBLE level - extremely hard calculations
function generateStage11Question() {
    const questionType = Math.random();

    if (questionType < 0.25) {
        // Large number exponential calculations
        const base = Math.floor(Math.random() * 15) + 10; // 10-24
        const power = Math.floor(Math.random() * 3) + 2; // 2-4
        const divisor = Math.floor(Math.random() * 7) + 2; // 2-8
        const offset = Math.floor(Math.random() * 500) + 100; // 100-599

        // Calculate the result correctly with Math.pow
        let result = Math.pow(base, power) / divisor + offset;

        // Ensure we get a whole number by adjusting if needed
        if (result !== Math.floor(result)) {
            result = Math.floor(result);
            // Work backwards to get a whole number result
            const newOffset = result - Math.floor(Math.pow(base, power) / divisor);

            currentQuestion = {
                expression: `${base}^${power} / ${divisor} + ${newOffset}`,
                answer: result
            };
        } else {
            currentQuestion = {
                expression: `${base}^${power} / ${divisor} + ${offset}`,
                answer: result
            };
        }
    } else if (questionType < 0.5) {
        // Multiple large number operations with subtraction
        const num1 = Math.floor(Math.random() * 400) + 600; // 600-999
        const num2 = Math.floor(Math.random() * 200) + 400; // 400-599
        const num3 = Math.floor(Math.random() * 100) + 200; // 200-299
        const num4 = Math.floor(Math.random() * 100) + 100; // 100-199

        // Create complex expression with large numbers
        const expression = `${num1} - ${num2} + ${num3} - ${num4}`;

        currentQuestion = {
            expression: expression,
            answer: eval(expression)
        };
    } else if (questionType < 0.75) {
        // Double exponential with division and addition
        const base1 = Math.floor(Math.random() * 8) + 5; // 5-12
        const power1 = Math.floor(Math.random() * 2) + 2; // 2-3
        const base2 = Math.floor(Math.random() * 6) + 3; // 3-8
        const power2 = Math.floor(Math.random() * 2) + 2; // 2-3
        let divisor = Math.floor(Math.random() * 5) + 2; // 2-6

        // Calculate the result correctly using Math.pow
        let result = (Math.pow(base1, power1) + Math.pow(base2, power2)) / divisor;

        // Ensure we get a whole number by adjusting if needed
        if (result !== Math.floor(result)) {
            // Find a divisor that gives a whole number
            for (let i = 2; i <= 10; i++) {
                const testResult = (Math.pow(base1, power1) + Math.pow(base2, power2)) / i;
                if (testResult === Math.floor(testResult)) {
                    divisor = i;
                    result = testResult;
                    break;
                }
            }
        }

        currentQuestion = {
            expression: `(${base1}^${power1} + ${base2}^${power2}) / ${divisor}`,
            answer: result
        };
    } else {
        // Ultimate challenge: Large exponent with nested operations
        const base = Math.floor(Math.random() * 10) + 10; // 10-19
        const power = 2; // Square for manageability
        const num1 = Math.floor(Math.random() * 300) + 600; // 600-899
        const num2 = Math.floor(Math.random() * 300) + 200; // 200-499
        const multiplier = Math.floor(Math.random() * 10) + 5;

        // Create expression and properly evaluate it with Math.pow
        const expression = `(${base}^${power} * ${multiplier}) + ${num1} - ${num2}`;
        const answer = (Math.pow(base, power) * multiplier) + num1 - num2;

        currentQuestion = {
            expression: expression,
            answer: answer
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
    questionElement.classList.add('text-red-600');
    const warningElement = document.createElement('div');
    warningElement.className = 'text-sm text-red-500 font-bold mt-2';
    warningElement.textContent = '⚠️ IMPOSSIBLE LEVEL ⚠️';
    questionElement.appendChild(warningElement);
    questionElement.classList.add('animate-pulse');
    setTimeout(() => {
        questionElement.classList.remove('animate-pulse');
    }, 2000);
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining -= 0.1;

        if (timeRemaining <= 0) {
            timeRemaining = 0;
            clearInterval(timerInterval);
            handleTimeUp();
        }

        updateTimerDisplay();
    }, 100);
}

function updateTimerDisplay() {
    const timeDisplay = document.getElementById('time-display');
    const timerBar = document.getElementById('timer-bar');

    timeDisplay.textContent = `${Math.round(timeRemaining)}s`;

    const effectiveMaxTime = currentStage === 11 ? Math.min(30, maxTime) : maxTime;

    const percentage = (timeRemaining / effectiveMaxTime) * 100;
    timerBar.style.width = `${percentage}%`;

    if (timeRemaining < 10) {
        timerBar.classList.remove('bg-purple-500', 'bg-yellow-500');
        timerBar.classList.add('bg-red-500');
    } else if (timeRemaining < 20) {
        timerBar.classList.remove('bg-purple-500', 'bg-red-500');
        timerBar.classList.add('bg-yellow-500');
    } else {
        timerBar.classList.remove('bg-red-500', 'bg-yellow-500');
        timerBar.classList.add('bg-purple-500');
    }

    if (currentStage === 11) {
        timerBar.classList.add('animate-pulse');
    } else {
        timerBar.classList.remove('animate-pulse');
    }
}

function handleTimeUp() {
    gameOver = true;
    currentStreak = 0;
    streakElement.textContent = currentStreak;

    if (newButtonCooldown) {
        clearInterval(cooldownInterval);
        newButtonCooldown = false;
    }

    feedbackElement.textContent = `Time's up! The answer was ${currentQuestion.answer}`;
    feedbackElement.className = 'text-red-500 font-bold';

    answerInput.disabled = true;
    submitBtn.disabled = true;

    newBtn.innerHTML = 'Reset Game <i class="fas fa-sync-alt ml-2"></i>';
    newBtn.disabled = false;
    newBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700', 'opacity-50', 'cursor-not-allowed');
    newBtn.classList.add('bg-green-600', 'hover:bg-green-700');

    questionElement.textContent = `Game Over! Final Score: ${score} (Stage ${currentStage})`;
}

function checkAnswer() {
    if (gameOver) return;

    const userAnswer = parseInt(answerInput.value);

    if (isNaN(userAnswer)) {
        feedbackElement.textContent = 'Please enter a valid whole number!';
        feedbackElement.className = 'text-red-500 font-medium';
        return;
    }

    questionsAttempted++;
    attemptedElement.textContent = questionsAttempted;

    clearInterval(timerInterval);

    let basePoints = 5; 
    if (currentStage === 11) basePoints = 50;

    const stageMultiplier = currentStage;
    const streakBonus = Math.floor(currentStreak / 3); 

    if (userAnswer === currentQuestion.answer) {
        let points = basePoints * stageMultiplier + streakBonus;

        if (currentStage === 11) {
            points *= 2;
        }

        score += points;
        currentStreak++;
        correctAnswers++;

        if (currentStreak > highestStreak) {
            highestStreak = currentStreak;
            highestStreakElement.textContent = highestStreak;
        }
        let timeBonus = Math.min(8, 2 + Math.floor(currentStage / 2) + Math.floor(currentStreak / 4));

        if (currentStage === 11) {
            timeBonus = Math.min(15, 10 + Math.floor(currentStreak / 2));
        }

        timeRemaining = Math.min(maxTime, timeRemaining + timeBonus); //CHEAT

        if (currentStage === 11) {
            feedbackElement.textContent = `INCREDIBLE! +${points} points, +${timeBonus}s 🔥🔥🔥`;
            feedbackElement.className = 'text-green-500 font-bold text-xl';
            questionElement.classList.add('correct-answer', 'animate-bounce');
        } else {
            feedbackElement.textContent = `Correct! +${points} points, +${timeBonus}s 🎉`;
            feedbackElement.className = 'text-green-500 font-bold';
            questionElement.classList.add('correct-answer');
        }

        setTimeout(() => {
            questionElement.classList.remove('correct-answer', 'animate-bounce');
        }, 800);
    } else {
        currentStreak = 0;
        let timePenalty = 3 + Math.floor(currentStage * 1.5);

        if (currentStage === 11) {
            timePenalty = 15; 
        }

        timeRemaining = Math.max(0, timeRemaining - timePenalty);


        if (currentStage === 11) {
            feedbackElement.textContent = `BRUTAL! -${timePenalty}s. The answer was ${currentQuestion.answer}`;
            feedbackElement.className = 'text-red-600 font-bold text-lg';
        } else {
            feedbackElement.textContent = `Wrong! -${timePenalty}s. The answer was ${currentQuestion.answer}`;
            feedbackElement.className = 'text-red-500 font-medium';
        }

        questionElement.classList.add('wrong-answer');

        setTimeout(() => {
            questionElement.classList.remove('wrong-answer');
        }, 500);

        if (timeRemaining <= 0) {
            timeRemaining = 0;
            updateTimerDisplay();
            handleTimeUp();
            return;
        }
    }

    scoreElement.textContent = score;
    streakElement.textContent = currentStreak;
    correctElement.textContent = correctAnswers;
    accuracyElement.textContent = Math.round((correctAnswers / questionsAttempted) * 100) + '%';

    updateTimerDisplay();

    if (timerStarted && timeRemaining > 0 && !gameOver) {
        startTimer();
    }

    setTimeout(() => {
        if (!gameOver) {
            questionElement.classList.remove('text-red-600');
            const warningElement = questionElement.querySelector('div');
            if (warningElement) warningElement.remove();

            generateQuestion();
        }
    }, 1800);
}


document.addEventListener('DOMContentLoaded', () => {
    generateQuestion();

    submitBtn.addEventListener('click', () => {
        if (gameOver) return;

        if (!timerStarted) {
            startTimer();
            timerStarted = true;
        }
        checkAnswer();
    });

    newBtn.addEventListener('click', () => {
        if (gameOver) {
            resetGame();
        } else {
            generateQuestion();
        }
    });

    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !gameOver) {
            if (!timerStarted) {
                startTimer();
                timerStarted = true;
            }
            checkAnswer();
        }
    });
});