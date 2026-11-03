import { quizData } from './introduction-data.js';
import { mountQuiz } from './quiz-engine.js';
import { mountBuilder } from './introduction-builder.js';
const lang=document.documentElement.lang==='ru'?'ru':'uk';
document.querySelectorAll('[data-quiz="self-introduction"]').forEach(root=>mountQuiz(root,quizData,lang));
document.querySelectorAll('[data-builder="self-introduction"]').forEach(root=>mountBuilder(root,lang));
