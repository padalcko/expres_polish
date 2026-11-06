import { quizData } from './doctor-data.js';
import { mountQuiz } from './quiz-engine.js';
const lang=document.documentElement.lang==='ru'?'ru':'uk';
document.querySelectorAll('[data-quiz="doctor"]').forEach(root=>mountQuiz(root,quizData,lang));
