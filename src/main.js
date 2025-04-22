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
let stageThresholds = [0, 20, 50, 80, 140, 250, 400, 680, 970, 1500, 2860];
let newButtonCooldown = false;
let cooldownDuration = 5;
let cooldownRemaining = 0;
let cooldownInterval;
let stageUpNotification;
let freezeTimeItems = 1;
let showAnswerItems = 1;
let maxPowerupItems = 5; 
let powerupDropChance = 0.2; // 30% chance to get a power-up on correct answer
let powerupDropThreshold = 3;

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
let freezeTimeBtn = document.getElementById('freeze-time-btn');
let showAnswerBtn = document.getElementById('show-answer-btn');

function initializePowerUps() {
    const powerupsContainer = document.createElement('div');
    powerupsContainer.className = 'flex flex-nowrap justify-center gap-2 items-center mt-4 mb-6';
    powerupsContainer.innerHTML = `
        <div class="flex items-center">
            <button id="freeze-time-btn" class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                <i class="fas fa-snowflake mr-1"></i> Freeze Time
                <span id="freeze-time-count" class="ml-1 bg-blue-700 px-2 py-0.5 rounded-full text-xs">${freezeTimeItems}</span>
            </button>
        </div>
        <div class="flex items-center">
            <button id="show-answer-btn" class="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                <i class="fas fa-lightbulb mr-1"></i> Show Answer
                <span id="show-answer-count" class="ml-1 bg-purple-700 px-2 py-0.5 rounded-full text-xs">${showAnswerItems}</span>
            </button>
        </div>
    `;

    const gameControlsContainer = document.querySelector('.flex.justify-between.items-center.mb-6');
    gameControlsContainer.parentNode.insertBefore(powerupsContainer, gameControlsContainer);

    freezeTimeBtn = document.getElementById('freeze-time-btn');
    showAnswerBtn = document.getElementById('show-answer-btn');

    updatePowerupButtons();

    freezeTimeBtn.addEventListener('click', useFreezeTime);
    showAnswerBtn.addEventListener('click', useShowAnswer);
}

function updatePowerupButtons() {
    document.getElementById('freeze-time-count').textContent = freezeTimeItems;
    document.getElementById('show-answer-count').textContent = showAnswerItems;

    freezeTimeBtn.disabled = freezeTimeItems <= 0 || gameOver;
    showAnswerBtn.disabled = showAnswerItems <= 0 || gameOver;
}

function checkForPowerupDrop() {
    if (currentStage < powerupDropThreshold) return; // atleast stage 3

    let adjustedChance = powerupDropChance + (currentStage * 0.02) + (currentStreak * 0.01);
    adjustedChance = Math.min(adjustedChance, 0.7);

    if (Math.random() < adjustedChance) {
        if (Math.random() < 0.5 && freezeTimeItems < maxPowerupItems) {
            freezeTimeItems++;
            showPowerupAnimation('freeze-time');
        } else if (showAnswerItems < maxPowerupItems) {
            showAnswerItems++;
            showPowerupAnimation('show-answer');
        } else if (freezeTimeItems < maxPowerupItems) {
            freezeTimeItems++;
            showPowerupAnimation('freeze-time');
        }

        updatePowerupButtons();
    }
}

function showPowerupAnimation(type) {
    const notification = document.createElement('div');

    if (type === 'freeze-time') {
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = '<i class="fas fa-snowflake mr-2"></i> Freeze Time power-up acquired!';
    } else {
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = '<i class="fas fa-lightbulb mr-2"></i> Show Answer power-up acquired!';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function useFreezeTime() {
    if (freezeTimeItems <= 0 || gameOver) return;

    freezeTimeItems--;
    updatePowerupButtons();

    clearInterval(timerInterval);
    timerInterval = null;

    const freezeEffect = document.createElement('div');
    freezeEffect.className = 'fixed inset-0 bg-blue-400 opacity-80 bg-opacity-80 z-40 transition-opacity duration-500';
    document.body.appendChild(freezeEffect);

    let freezeTimeRemaining = 5;
    const freezeCountdown = document.createElement('div');
    freezeCountdown.className = 'fixed top-3/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-blue-700 z-50';
    freezeCountdown.textContent = freezeTimeRemaining;
    document.body.appendChild(freezeCountdown);

    feedbackElement.textContent = 'Time Frozen! Take your time to solve the question.';
    feedbackElement.className = 'text-blue-500 font-bold';

    const freezeInterval = setInterval(() => {
        freezeTimeRemaining--;
        freezeCountdown.textContent = freezeTimeRemaining;

        if (freezeTimeRemaining <= 0) {
            clearInterval(freezeInterval);
            document.body.removeChild(freezeEffect);
            document.body.removeChild(freezeCountdown);
            if (!gameOver) {
                startTimer();
                feedbackElement.textContent = 'Time resumes!';
                feedbackElement.className = 'text-gray-600';
            }
        }
    }, 1000);
}

function useShowAnswer() {
    if (showAnswerItems <= 0 || gameOver) return;

    showAnswerItems--;
    updatePowerupButtons();

    const answerReveal = document.createElement('div');
    answerReveal.className = 'fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-700 text-white px-8 py-6 rounded-lg shadow-xl z-50 text-center';
    const answer = currentQuestion.answer;

    answerReveal.innerHTML = `
        <div class="text-2xl font-bold mb-2">The answer is:</div>
        <div class="text-4xl font-bold">${answer}</div>
        <div class="text-sm mt-4">You can still type it in!</div>
    `;
    document.body.appendChild(answerReveal);

    answerInput.classList.add('ring-4', 'ring-purple-400');
    answerInput.focus();

    setTimeout(() => {
        document.body.removeChild(answerReveal);
        answerInput.classList.remove('ring-4', 'ring-purple-400');
    }, 1000);
}


document.addEventListener('keydown', (e) => {
    // cheat for testing
    if (e.code === 'KeyA') {
        answerInput.value = currentQuestion.answer;
        answerInput.classList.add('bg-yellow-100');
        setTimeout(() => answerInput.classList.remove('bg-yellow-100'), 1000);
    }
});


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
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (newButtonCooldown) {
        clearInterval(cooldownInterval);
        newButtonCooldown = false;
    }

    document.body.classList.remove('stage-11-active');
    
    score = 0;
    currentStreak = 0;
    highestStreak = 0;
    questionsAttempted = 0;
    correctAnswers = 0;
    timeRemaining = 30;
    timerStarted = false;
    gameOver = false;
    currentStage = 1;
    freezeTimeItems = 1;
    showAnswerItems = 1;

    scoreElement.textContent = score;
    streakElement.textContent = currentStreak;
    attemptedElement.textContent = questionsAttempted;
    correctElement.textContent = correctAnswers;
    accuracyElement.textContent = '0%';
    highestStreakElement.textContent = highestStreak;
    document.getElementById('current-stage').textContent = currentStage;
    updatePowerupButtons();

    newBtn.innerHTML = 'New Question <i class="fas fa-redo ml-2"></i>';
    newBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'opacity-50', 'cursor-not-allowed');
    newBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
    newBtn.disabled = false;
    
    answerInput.disabled = false;
    submitBtn.disabled = false;

    const stageImage = document.getElementById('stage-image');
    stageImage.classList.add('hidden');
    questionElement.classList.remove('text-red-600', 'animate-pulse');
    const warningElement = questionElement.querySelector('div');
    if (warningElement) warningElement.remove();

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
        stageUpNotification = document.createElement('div');

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
        }, 2000);
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
        case 2: // Easy - adddition/subtraction with slightly larger numbers
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
        num1 = Math.floor(Math.random() * 25) + 1; // 1-25
        num2 = Math.floor(Math.random() * 25) + 1; // 1-25
    } else { // Subtraction
        num1 = Math.floor(Math.random() * 25) + 5; // 5-29
        num2 = Math.floor(Math.random() * num1) + 1; // Ensures num2 < num1 for positive result
    }

    currentQuestion = {
        expression: `${num1} ${operation} ${num2}`,
        answer: eval(`${num1} ${operation} ${num2}`)
    };

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 2: Easy - addition/subtraction with slightly larger numbers
function generateStage2Question() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2;

    if (operation === '+') {
        num1 = Math.floor(Math.random() * 90) + 10; // 10-99
        num2 = Math.floor(Math.random() * 90) + 10; // 10-99
    } else { // Subtraction
        num1 = Math.floor(Math.random() * 90) + 25; // 25-94
        num2 = Math.floor(Math.random() * num1) + 1; // Ensures num2 < num1 for positive result
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
        const num1 = Math.floor(Math.random() * 10) + 2; // 2-11
        const num2 = Math.floor(Math.random() * 10) + 2; // 2-11

        currentQuestion = {
            expression: `${num1} * ${num2}`,
            answer: num1 * num2
        };
    } else { // Division with whole number results
        const divisor = Math.floor(Math.random() * 10) + 2; // 2-11
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

    let num1 = Math.floor(Math.random() * 25) + 10; // 10-34
    let num2 = Math.floor(Math.random() * 20) + 5; // 5-34
    let num3 = Math.floor(Math.random() * 25) + 5; // 5-39

    // Ensure no negative results for first operation
    if (op1 === '-' && num2 > num1) {
        [num1, num2] = [num2, num1]; // Swap to ensure positive result
    }

    // Calculate intermediate result to check second operation
    let tempResult = eval(`${num1} ${op1} ${num2}`);
    
    // Ensure no negative results for second operation
    if (op2 === '-' && num3 > tempResult) {
        // Switch to addition to guarantee positive result
        op2 = '+';
    }

    const expression = `${num1} ${op1} ${num2} ${op2} ${num3}`;
    
    currentQuestion = {
        expression: expression,
        answer: eval(expression)
    };

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 5: Mixed operations with larger numbers
function generateStage5Question() {
    const operations = ['+', '-', '*'];
    const questionType = Math.random();

    if (questionType < 0.5) { // Single operation with larger numbers
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let num1, num2;

        if (operation === '+') {
            num1 = Math.floor(Math.random() * 30) + 20; // 20-49
            num2 = Math.floor(Math.random() * 30) + 10; // 10-39
        } else if (operation === '-') {
            num1 = Math.floor(Math.random() * 50) + 30; // 30-79
            num2 = Math.floor(Math.random() * (num1 - 5)) + 5; // Ensures num2 < num1 for positive result
        } else { // Multiplication
            num1 = Math.floor(Math.random() * 12) + 4; // 4-15
            num2 = Math.floor(Math.random() * 12) + 3; // 3-14
        }

        currentQuestion = {
            expression: `${num1} ${operation} ${num2}`,
            answer: eval(`${num1} ${operation} ${num2}`)
        };
    } else { // Mix addition/subtraction with multiplication
        const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
        const num2 = Math.floor(Math.random() * 10) + 2; // 2-11
        const num3 = Math.floor(Math.random() * 8) + 2; // 2-9

        const patterns = [
            `${num1} + ${num2} * ${num3}`,  
            `${num1} * ${num2} + ${num3}`  
        ];
        
        const expression = patterns[Math.floor(Math.random() * patterns.length)];

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
    const op1 = operations[Math.floor(Math.random() * operations.length)];
    let op2 = operations[Math.floor(Math.random() * operations.length)];
    let op3 = operations[Math.floor(Math.random() * operations.length)];

    let num1 = Math.floor(Math.random() * 15) + 10; // 10-24
    let num2 = Math.floor(Math.random() * 10) + 5; // 5-14
    let num3 = Math.floor(Math.random() * 10) + 5; // 5-14
    let num4 = Math.floor(Math.random() * 8) + 3; // 3-10

    if (op1 === '-' && num2 > num1) {
        [num1, num2] = [num2, num1]; // Swap to ensure positive result
    }

    let expression = `${num1} ${op1} ${num2}`;
    let tempResult = eval(expression);

    if (op2 === '-' && tempResult < num3) {
        op2 = '+'; // Switch to addition to ensure positive ressult
    }
    
    expression = `${expression} ${op2} ${num3}`;
    tempResult = eval(expression);

    if (op3 === '-' && tempResult < num4) {
        op3 = '+'; // Switch to addition to ensure positive ressult
    }
    
    expression = `${expression} ${op3} ${num4}`;

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
        const op1 = operations[Math.floor(Math.random() * operations.length)];
        const op2 = operations[Math.floor(Math.random() * operations.length)];

        let num1 = Math.floor(Math.random() * 15) + 8; // 8-22
        let num2 = Math.floor(Math.random() * 8) + 3; // 3-10
        let num3 = Math.floor(Math.random() * 10) + 4; // 4-13

        if (op1 === '-' && num2 > num1) {
            [num1, num2] = [num2, num1]; // Swap for positive result inside parentheses
        }

        // Create expression with parentheses
        let expression = `(${num1} ${op1} ${num2}) ${op2} ${num3}`;
        
        let innerResult;
        switch(op1) {
            case '+': innerResult = num1 + num2; break;
            case '-': innerResult = num1 - num2; break;
            case '*': innerResult = num1 * num2; break;
        }
        
        let finalResult;
        switch(op2) {
            case '+': finalResult = innerResult + num3; break;
            case '-': finalResult = innerResult - num3; break;
            case '*': finalResult = innerResult * num3; break;
        }

        if (finalResult < 0 && op2 === '-') {
            op2 = '+';
            expression = `(${num1} ${op1} ${num2}) ${op2} ${num3}`;
            finalResult = innerResult + num3;
        }

        currentQuestion = {
            expression: expression,
            answer: finalResult
        };
    } else {
        const op1 = operations[Math.floor(Math.random() * operations.length)];
        const op2 = operations[Math.floor(Math.random() * operations.length)];

        let num1 = Math.floor(Math.random() * 20) + 5; // 5-24
        let num2 = Math.floor(Math.random() * 22) + 5; // 5-26
        let num3 = Math.floor(Math.random() * 15) + 2; // 2-16


        if (op1 === '-' && num3 > num2) {
            [num2, num3] = [num3, num2]; // Swap to ensure positive result inside parentheses
        }

        let innerResult;
        switch(op1) {
            case '+': innerResult = num2 + num3; break;
            case '-': innerResult = num2 - num3; break;
            case '*': innerResult = num2 * num3; break;
        }
        
        let expression;
        let finalResult;
        
        // Always ensure positive results
        if (op2 === '-') {
            if (innerResult > num1) {
                expression = `(${num2} ${op1} ${num3}) - ${num1}`;
                finalResult = innerResult - num1;
            } else {
                expression = `${num1} - (${num2} ${op1} ${num3})`;
                finalResult = num1 - innerResult;
            }
        } else if (op2 === '+') {
            expression = `${num1} + (${num2} ${op1} ${num3})`;
            finalResult = num1 + innerResult;
        } else { // '*'
            expression = `${num1} * (${num2} ${op1} ${num3})`;
            finalResult = num1 * innerResult;
        }

        currentQuestion = {
            expression: expression,
            answer: finalResult
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
        // Expression with division that results in whole number
        const divisor = Math.floor(Math.random() * 5) + 2; // 2-6
        const multiplier = Math.floor(Math.random() * 5) + 2; // 2-6
        const dividend = divisor * multiplier; // Guarantees whole number result

        const num1 = Math.floor(Math.random() * 10) + 5; // 5-14
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

    if (questionType < 0.33) {
        // Deeply nested parentheses with mixed operations
        const num1 = Math.floor(Math.random() * 25) + 5; // 5-29
        const num2 = Math.floor(Math.random() * 20) + 5; // 5-24
        const num3 = Math.floor(Math.random() * 15) + 3; // 3-17
        const num4 = Math.floor(Math.random() * 12) + 2; // 2-13
        const num5 = Math.floor(Math.random() * 10) + 2; // 2-11

        const expression = `${num1} * ((${num2} + ${num3}) * (${num4} + ${num5}))`;

        currentQuestion = {
            expression: expression,
            answer: num1 * ((num2 + num3) * (num4 + num5))
        };
    } else if (questionType < 0.66) {
        // Multiple parenthetical groups with mixed operations
        const num1 = Math.floor(Math.random() * 22) + 3; // 3-24
        const num2 = Math.floor(Math.random() * 20) + 3; // 3-22
        const num3 = Math.floor(Math.random() * 15) + 2; // 2-16
        const num4 = Math.floor(Math.random() * 12) + 2; // 2-13
        const num5 = Math.floor(Math.random() * 10) + 2; // 2-11
        const num6 = Math.floor(Math.random() * 8) + 2;  // 2-9

        // Balanced operations between multiple parenthetical groups
        const expression = `(${num1} * ${num2} + ${num3}) - (${num4} * ${num5} - ${num6})`;
        
        // Calculate answer manually to ensure positive result
        let leftPart = num1 * num2 + num3;
        let rightPart = num4 * num5 - num6;
        let result = leftPart - rightPart;
        
        // If result would be negative, switch operation to addition
        if (result < 0) {
            const expression = `(${num1} * ${num2} + ${num3}) + (${num4} * ${num5} - ${num6})`;
            result = leftPart + rightPart;
            
            currentQuestion = {
                expression: expression,
                answer: result
            };
        } else {
            currentQuestion = {
                expression: expression,
                answer: result
            };
        }
    } else {
        // Complex expression with interleaved parentheses and operations
        const num1 = Math.floor(Math.random() * 15) + 5; // 5-19
        const num2 = Math.floor(Math.random() * 12) + 3; // 3-14
        const num3 = Math.floor(Math.random() * 10) + 2; // 2-11
        const num4 = Math.floor(Math.random() * 8) + 2;  // 2-9
        const num5 = Math.floor(Math.random() * 6) + 2;  // 2-7

        // Complex interleaved expression with nested elements
        const expression = `${num1} * (${num2} + ${num3} * (${num4} - ${num5}))`;
        
        // Calculate manually to ensure correct result
        let innermost = num4 - num5;
        // Ensure innermost result is positive
        if (innermost < 0) {
            [num4, num5] = [num5, num4]; // Swap to ensure positive result
            innermost = num5 - num4;
        }
        
        let middle = num3 * innermost;
        let innerTotal = num2 + middle;
        let result = num1 * innerTotal;

        currentQuestion = {
            expression: `${num1} * (${num2} + ${num3} * (${Math.max(num4, num5)} - ${Math.min(num4, num5)}))`,
            answer: result
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 10: Expert level with powers, roots, and complex operations
function generateStage10Question() {
    const questionType = Math.random();

    if (questionType < 0.25) {
        // Multiple exponents with complex operations
        const base1 = Math.floor(Math.random() * 5) + 2; // 2-6
        const power1 = Math.floor(Math.random() * 2) + 2; // 2-3
        const base2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const power2 = Math.floor(Math.random() * 2) + 2; // 2-3
        const base3 = Math.floor(Math.random() * 3) + 2; // 2-4
        const power3 = 2; // Square for manageable calculation

        // Complex expression with multiple powers and multiplication
        const expression = `${base1}^${power1} + ${base2}^${power2} * ${base3}^${power3}`;
        
        // Calculate the result
        const result = Math.pow(base1, power1) + (Math.pow(base2, power2) * Math.pow(base3, power3));

        currentQuestion = {
            expression: expression,
            answer: result
        };
    } else if (questionType < 0.5) {
        // Factorial operation (manually calculated)
        const num = Math.floor(Math.random() * 5) + 3; // 3-7 (manageable factorial size)
        
        // Calculate factorial
        let factorial = 1;
        for (let i = 2; i <= num; i++) {
            factorial *= i;
        }
        
        // Add second operation with another small factorial or power
        const num2 = Math.floor(Math.random() * 3) + 2; // 2-4
        let factorial2 = 1;
        for (let i = 2; i <= num2; i++) {
            factorial2 *= i;
        }
        
        // Create expression with factorials - always using multiplication or addition for positive results
        const operations = ['+', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        const expression = `${num}! ${operation} ${num2}!`;
        
        let answer;
        if (operation === '+') {
            answer = factorial + factorial2;
        } else {
            answer = factorial * factorial2;
        }
        
        currentQuestion = {
            expression: expression,
            answer: answer
        };
    } else if (questionType < 0.75) {
        // Exponents within nested parentheses and multiple operations
        const base1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const power1 = 2; // Square for manageable calculation
        const num1 = Math.floor(Math.random() * 15) + 5; // 5-19
        const base2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const power2 = 2; // Square for manageable calculation
        const num2 = Math.floor(Math.random() * 10) + 5; // 5-14

        const expression = `(${base1}^${power1} * ${num1}) - (${base2}^${power2} * ${num2})`;
        
        // Calculate results manually
        const part1 = Math.pow(base1, power1) * num1;
        const part2 = Math.pow(base2, power2) * num2;
        
        // Ensure positive result
        if (part1 >= part2) {
            currentQuestion = {
                expression: expression,
                answer: part1 - part2
            };
        } else {
            // Swap operations to ensure positive result
            const expression = `(${base2}^${power2} * ${num2}) - (${base1}^${power1} * ${num1})`;
            currentQuestion = {
                expression: expression,
                answer: part2 - part1
            };
        }
    } else {
        // Advanced algebraic expression with multiple operations
        const base = Math.floor(Math.random() * 5) + 3; // 3-7
        const num1 = Math.floor(Math.random() * 10) + 5; // 5-14
        const num2 = Math.floor(Math.random() * 12) + 3; // 3-14
        const num3 = Math.floor(Math.random() * 8) + 2; // 2-9
        
        // Calculate the base squared
        const baseSquared = Math.pow(base, 2);
        
        // Calculate middle sum
        const middleSum = num1 + num2;
        
        // Find an appropriate divisor that ensures a whole number result
        let divisor = num3;
        let product = baseSquared * middleSum;
        
        // Ensure the division results in a whole number
        if (product % divisor !== 0) {
            // Find a divisor that works (that is a factor of the product)
            for (let i = 2; i <= Math.min(15, product); i++) {
                if (product % i === 0) {
                    divisor = i;
                    break;
                }
            }
        }
        
        const expression = `${base}^2 * (${num1} + ${num2}) / ${divisor}`;
        const answer = (baseSquared * middleSum) / divisor;
        
        currentQuestion = {
            expression: expression,
            answer: answer
        };
    }

    questionElement.textContent = `${currentQuestion.expression} = ?`;
}

// Stage 11: IMPOSSIBLE level - extremely hard calculations
function generateStage11Question() {
    const questionType = Math.random();

    if (questionType < 0.25) {
        // Large number exponential calculations with whole number results
        const base = Math.floor(Math.random() * 10) + 5; // 5-14
        const power = Math.floor(Math.random() * 2) + 2; // 2-3
        const divisor = Math.floor(Math.random() * 5) + 2; // 2-6
        
        // Calculate the base result
        const baseResult = Math.pow(base, power);
        
        // Find a divisor that gives a whole number
        let finalDivisor = divisor;
        for (let i = 2; i <= 10; i++) {
            if (baseResult % i === 0) {
                finalDivisor = i;
                break;
            }
        }
        
        // Ensure we get a whole number by calculating offset
        const quotient = Math.floor(baseResult / finalDivisor);
        const offset = Math.floor(Math.random() * 500) + 100; // 100-599

        currentQuestion = {
            expression: `${base}^${power} / ${finalDivisor} + ${offset}`,
            answer: quotient + offset
        };
    } else if (questionType < 0.5) {
        // Multiple large number operations - using addition and subtraction carefully
        const num1 = Math.floor(Math.random() * 400) + 600; // 600-999
        const num2 = Math.floor(Math.random() * 200) + 200; // 200-399 (reduced to ensure positive result)
        const num3 = Math.floor(Math.random() * 100) + 200; // 200-299
        const num4 = Math.floor(Math.random() * 100) + 50; // 50-149 (reduced to ensure positive result)

        // Ensure final result is positive by checking intermediate steps
        let step1 = num1 - num2;
        // If step1 is negative, swap numbers
        if (step1 < 0) {
            [num1, num2] = [num2, num1];
            step1 = num2 - num1;
        }
        
        // Now add num3
        let step2 = step1 + num3;
        
        // Final step - ensure positive result
        if (step2 < num4) {
            // If would be negative, use addition instead
            const expression = `${num1} - ${num2} + ${num3} + ${num4}`;
            currentQuestion = {
                expression: expression,
                answer: eval(expression)
            };
        } else {
            const expression = `${num1} - ${num2} + ${num3} - ${num4}`;
            currentQuestion = {
                expression: expression,
                answer: eval(expression)
            };
        }
    } else if (questionType < 0.75) {
        // Double exponential with division and addition - ensure whole number result
        const base1 = Math.floor(Math.random() * 4) + 3; // 3-6 (reduced range for manageable numbers)
        const power1 = Math.floor(Math.random() * 2) + 2; // 2-3
        const base2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const power2 = Math.floor(Math.random() * 2) + 2; // 2-3

        // Calculate the sum of powers
        const sumOfPowers = Math.pow(base1, power1) + Math.pow(base2, power2);
        
        // Find a divisor that gives a whole number result
        let divisor = 1;
        for (let i = 2; i <= Math.min(10, sumOfPowers); i++) {
            if (sumOfPowers % i === 0) {
                divisor = i;
                break;
            }
        }

        currentQuestion = {
            expression: `(${base1}^${power1} + ${base2}^${power2}) / ${divisor}`,
            answer: sumOfPowers / divisor
        };
    } else {
        // Ultimate challenge: Large exponent with nested operations
        const base = Math.floor(Math.random() * 5) + 5; // 5-9 (reduced range for manageable numbers)
        const power = 2; // Square for manageability
        const multiplier = Math.floor(Math.random() * 5) + 3; // 3-7
        const num1 = Math.floor(Math.random() * 200) + 300; // 300-499
        const num2 = Math.floor(Math.random() * 100) + 100; // 100-199

        // Create expression and properly evaluate it with Math.pow - ensure positive result
        const powerResult = Math.pow(base, power) * multiplier;
        
        // Ensure final result is positive
        if (powerResult + num1 > num2) {
            const expression = `(${base}^${power} * ${multiplier}) + ${num1} - ${num2}`;
            const answer = powerResult + num1 - num2;
            
            currentQuestion = {
                expression: expression,
                answer: answer
            };
        } else {
            // If would be negative, use addition instead
            const expression = `(${base}^${power} * ${multiplier}) + ${num1} + ${num2}`;
            const answer = powerResult + num1 + num2;
            
            currentQuestion = {
                expression: expression,
                answer: answer
            };
        }
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

    let percentage = (timeRemaining / effectiveMaxTime) * 100;
    percentage = Math.min(percentage, 100)
    
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

    const stageImage = document.getElementById('stage-image');
    stageImage.src = `src/images/stage ${currentStage}.gif`;
    stageImage.alt = `Stage ${currentStage} Completion`;

    stageImage.className = 'min-w-[250px] max-w-[250px] max-h-[250px] rounded-lg shadow-md mt-5';

    stageImage.classList.remove('hidden');
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

        checkForPowerupDrop();

        if (currentStreak > highestStreak) {
            highestStreak = currentStreak;
            highestStreakElement.textContent = highestStreak;
        }
        let timeBonus = Math.min(8, 2 + Math.floor(currentStage / 2) + Math.floor(currentStreak / 4));

        if (currentStage === 11) {
            timeBonus = Math.min(15, 10 + Math.floor(currentStreak / 2));
        }

        timeRemaining = Math.min(maxTime, timeRemaining + timeBonus);
        if (currentStage === 11) {
            feedbackElement.textContent = `INCREDIBLE! +${points} points, +${timeBonus}s 🔥🔥🔥`;
            feedbackElement.className = 'text-green-500 font-bold text-xl';
            questionElement.classList.add('correct-answer');
        } else {
            feedbackElement.textContent = `Correct! +${points} points, +${timeBonus}s 🎉`;
            feedbackElement.className = 'text-green-500 font-bold';
            questionElement.classList.add('correct-answer');
        }

        setTimeout(() => {
            questionElement.classList.remove('correct-answer');
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
    }, 500);
}


document.addEventListener('DOMContentLoaded', () => {
    generateQuestion();
    initializePowerUps();
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