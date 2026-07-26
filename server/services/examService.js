const ExamQuestion = require("../models/ExamQuestion");
const ExamPaper = require("../models/ExamPaper");

// --- Papers (a named, reusable set of questions a mentor can assign) ---
async function createPaper(mentorId, { businessTitle, title }) {
  return ExamPaper.create({ data: { mentorId, businessTitle, title } });
}

async function listPapersForMentor(mentorId, businessTitle) {
  return ExamPaper.findMany({
    where: { mentorId, businessTitle },
    include: { questions: true },
    orderBy: { createdAt: "desc" },
  });
}

async function deletePaper(id, mentorId) {
  return ExamPaper.deleteMany({ where: { id, mentorId } });
}

// --- Questions ---
async function addQuestion(mentorId, { businessTitle, paperId, question, options, correctIndex }) {
  return ExamQuestion.create({
    data: { mentorId, businessTitle, paperId, question, options, correctIndex: Number(correctIndex) },
  });
}

async function deleteQuestion(id, mentorId) {
  return ExamQuestion.deleteMany({ where: { id, mentorId } });
}

// Full detail (includes correct answers) - for the mentor managing questions.
async function listQuestionsForMentor(mentorId, businessTitle) {
  return ExamQuestion.findMany({
    where: { mentorId, businessTitle },
    orderBy: { createdAt: "asc" },
  });
}

// Answers stripped out - for a learner taking the exam. Uses the paper
// assigned to their enrollment if one was set; otherwise falls back to the
// full unassigned question pool for that course (keeps older/simple setups
// working without requiring a paper to be created first).
async function listQuestionsForExam(businessTitle, paperId) {
  const questions = await ExamQuestion.findMany({
    where: paperId ? { paperId } : { businessTitle, paperId: null },
    orderBy: { createdAt: "asc" },
  });
  return questions.map(({ id, question, options }) => ({ id, question, options }));
}

async function gradeExam(businessTitle, paperId, answers) {
  const questions = await ExamQuestion.findMany({
    where: paperId ? { paperId } : { businessTitle, paperId: null },
  });
  let score = 0;

  for (const q of questions) {
    const submitted = answers[q.id];
    if (submitted !== undefined && Number(submitted) === q.correctIndex) score++;
  }

  return { score, total: questions.length };
}

module.exports = {
  createPaper, listPapersForMentor, deletePaper,
  addQuestion, deleteQuestion,
  listQuestionsForMentor, listQuestionsForExam, gradeExam,
};
