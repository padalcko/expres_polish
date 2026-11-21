import { quizData } from './restaurant-data.js';
import { mountQuiz } from './quiz-engine.js';
const lang=document.documentElement.lang==='ru'?'ru':'uk';
document.querySelectorAll('[data-quiz="restaurant"]').forEach(root=>mountQuiz(root,quizData,lang));
