document.addEventListener('DOMContentLoaded', () => {
    const chapterBody = document.querySelector('body[data-chapter]');
    const totalScoreDisplay = document.getElementById('total-score-display');
    const scoreBall = document.getElementById('score-ball');

    // Initialize total score from localStorage or set to 0
    let totalScore = parseInt(localStorage.getItem('totalScore') || '0', 10);
    if (totalScoreDisplay) {
        totalScoreDisplay.textContent = totalScore;
    }

    // Only run quiz logic if we are on a chapter page
    if (chapterBody) {
        const chapterNumber = chapterBody.dataset.chapter;
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const nextQuestionBtn = document.getElementById('next-question-btn');

        let questions = [];
        let currentQuestionIndex = 0;
        let chapterScore = 0; // Score for the current chapter

        /**
         * Fetches questions from the corresponding JSON file.
         */
        async function fetchQuestions() {
            try {
                const response = await fetch(`data/chapter_${chapterNumber}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                questions = await response.json();
                loadQuestion();
            } catch (error) {
                console.error('Error loading questions:', error);
                questionText.textContent = 'Error loading quiz. Please try again later.';
                optionsContainer.innerHTML = '';
                nextQuestionBtn.classList.add('hidden');
            }
        }

        /**
         * Loads and displays the current question and its options.
         */
        function loadQuestion() {
            if (currentQuestionIndex < questions.length) {
                const question = questions[currentQuestionIndex];
                questionText.textContent = question.question;
                optionsContainer.innerHTML = ''; // Clear previous options
                nextQuestionBtn.classList.add('hidden'); // Hide next button initially

                question.options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.classList.add('option-btn');
                    button.textContent = option;
                    button.dataset.index = index; // Store index to check against correct_answer_index
                    button.addEventListener('click', handleOptionClick);
                    optionsContainer.appendChild(button);
                });
            } else {
                displayChapterScore();
            }
        }

        /**
         * Handles user clicking on an option.
         * @param {Event} event - The click event.
         */
        function handleOptionClick(event) {
            const selectedButton = event.target;
            const selectedIndex = parseInt(selectedButton.dataset.index, 10);
            const question = questions[currentQuestionIndex];
            const correctIndex = question.correct_answer_index;

            // Disable all options after a selection
            Array.from(optionsContainer.children).forEach(button => {
                button.classList.add('disabled');
                button.removeEventListener('click', handleOptionClick);
            });

            if (selectedIndex === correctIndex) {
                selectedButton.classList.add('correct');
                chapterScore += 1; // Increment chapter specific score
                updateTotalScore(1); // Increment global score
            } else {
                selectedButton.classList.add('incorrect');
                // Highlight the correct answer
                const correctButton = optionsContainer.querySelector(`[data-index="${correctIndex}"]`);
                if (correctButton) {
                    correctButton.classList.add('highlight-correct');
                }
            }
            nextQuestionBtn.classList.remove('hidden'); // Show next button
            nextQuestionBtn.textContent = (currentQuestionIndex === questions.length - 1) ? 'View Chapter Score' : 'Next Question';
        }

        /**
         * Updates the total score displayed in the floating ball and localStorage.
         * @param {number} pointsToAdd - The points to add to the total score.
         */
        function updateTotalScore(pointsToAdd) {
            totalScore += pointsToAdd;
            localStorage.setItem('totalScore', totalScore.toString());
            totalScoreDisplay.textContent = totalScore;

            // Add animation class to score ball
            scoreBall.classList.remove('score-added'); // Reset animation
            void scoreBall.offsetWidth; // Trigger reflow to restart animation
            scoreBall.classList.add('score-added');

            // Remove animation class after it finishes (adjust duration based on CSS)
            setTimeout(() => {
                scoreBall.classList.remove('score-added');
            }, 500); // Matches the popAndShrink animation duration
        }

        /**
         * Handles the "Next Question" button click.
         */
        function handleNextQuestion() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                displayChapterScore();
            }
        }

        /**
         * Displays the chapter score and offers to restart or go back to home.
         */
        function displayChapterScore() {
            questionText.innerHTML = `Chapter Complete!<br>You scored ${chapterScore} out of ${questions.length} in this chapter.`;
            optionsContainer.innerHTML = ''; // Clear options

            const restartButton = document.createElement('button');
            restartButton.textContent = 'Restart Chapter';
            restartButton.classList.add('option-btn'); // Reuse some styling
            restartButton.style.marginTop = '20px';
            restartButton.onclick = () => {
                currentQuestionIndex = 0;
                chapterScore = 0;
                loadQuestion();
            };

            const homeButton = document.createElement('button');
            homeButton.textContent = 'Back to Home';
            homeButton.classList.add('option-btn'); // Reuse some styling
            homeButton.style.marginTop = '10px';
            homeButton.onclick = () => {
                window.location.href = 'index.html';
            };

            optionsContainer.appendChild(restartButton);
            optionsContainer.appendChild(homeButton);
            nextQuestionBtn.classList.add('hidden'); // Hide next button at the end
        }

        // Event listener for the "Next Question" button
        nextQuestionBtn.addEventListener('click', handleNextQuestion);

        // Fetch questions when the page loads
        fetchQuestions();
    }
});