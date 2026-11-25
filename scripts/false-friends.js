import { quizData } from './false-friends-data.js';
import { mountQuiz } from './quiz-engine.js';
const lang=document.documentElement.lang==='ru'?'ru':'uk';
document.querySelectorAll('[data-quiz="false-friends"]').forEach(root=>mountQuiz(root,quizData,lang));
