import { quizData } from './geography-data.js';
import { mountQuiz } from './quiz-engine.js';
const lang=document.documentElement.lang==='ru'?'ru':'uk';
document.querySelectorAll('[data-quiz="geography"]').forEach(root=>mountQuiz(root,quizData,lang));
