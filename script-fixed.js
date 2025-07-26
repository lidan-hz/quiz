
let score = 0;
let saved = JSON.parse(localStorage.getItem('quizData') || '{}');
score = parseInt(localStorage.getItem('quizScore')) || 0;

document.getElementById('score-badge').textContent = score;

// Get current chapter ID from URL
const path = window.location.pathname;
const chapterMatch = path.match(/chapter\d+\.html/);
if (chapterMatch) {
  const chapterId = chapterMatch[0].replace('.html', '');
  const quizFile = `quiz/${chapterId}.json`;
  fetch(quizFile)
    .then(res => res.json())
    .then(questions => renderQuiz(chapterId, questions))
    .catch(err => console.error('Quiz loading error:', err));
}

function renderQuiz(topic, questions) {
  const container = document.getElementById('quiz-container');
  const section = document.createElement('section');
  section.innerHTML = `<h2>${topic.toUpperCase()} Quiz</h2>`;
  container.appendChild(section);

  questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `<h3>Q${idx + 1}: ${q.question}</h3>`;

    const scoreTag = document.createElement('div');
    scoreTag.className = 'per-question-score';
    div.appendChild(scoreTag);

    const buttonGroup = [];

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;

      // 判断该题是否已作答
      const previouslyAnswered = saved[topic] && saved[topic][idx] !== undefined;
      if (previouslyAnswered) {
        btn.disabled = true;
        if (saved[topic][idx] === i) {
          btn.classList.add('selected');
        }
      }

      btn.onclick = () => {
        if (!saved[topic]) saved[topic] = {};
        if (saved[topic][idx] === undefined) {
          saved[topic][idx] = i;

          if (i === q.answer) {
            score += 5;
            scoreTag.textContent = "+5 points!";
          } else {
            scoreTag.textContent = "Wrong!";
          }

          // 禁用所有按钮
          buttonGroup.forEach(b => b.disabled = true);
          btn.classList.add("selected");

          localStorage.setItem('quizData', JSON.stringify(saved));
          localStorage.setItem('quizScore', score);
          document.getElementById('score-badge').textContent = score;

          setTimeout(() => {
            div.style.display = 'none';
            const next = div.nextElementSibling;
            if (next) next.scrollIntoView({ behavior: 'smooth' });
            else showFinalScore();
          }, 800);
        }
      };

      buttonGroup.push(btn);
      div.appendChild(btn);
    });

    container.appendChild(div);
  });
}

function showFinalScore() {
  const container = document.getElementById('quiz-container');
  const result = document.createElement('div');
  result.className = 'final-score';
  result.innerHTML = `<h2>Your Total Score: ${score}</h2>`;
  container.appendChild(result);
}
