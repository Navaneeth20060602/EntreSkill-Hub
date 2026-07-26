import "./ExamPage.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchExamQuestions, submitExam, fetchMyEnrollments } from "../../services/examService";
import learningResources from "../../data/learningResources";
import { toast } from "../../context/ToastContext";

const SECONDS_PER_QUESTION = 60;

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function ExamPage() {
    const navigate = useNavigate();
    const businessTitle = localStorage.getItem("selectedBusiness");
    const skill = localStorage.getItem("primarySkill");

    const hasLearningResources = Boolean(learningResources[businessTitle]);
    const resourcesCompleted = localStorage.getItem(`resourcesCompleted:${businessTitle}`) === "true";
    const roadmapProgress = Number(localStorage.getItem("roadmapProgress") || 0);
    const canTakeExam = (!hasLearningResources || resourcesCompleted) && roadmapProgress >= 100;

    const [enrollment, setEnrollment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(canTakeExam);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(null);
    const submittedRef = useRef(false);

    useEffect(() => {
        if (!businessTitle) {
            navigate("/dashboard");
            return;
        }
        if (!canTakeExam) return;

        async function load() {
            const enrollments = await fetchMyEnrollments();
            const current = enrollments.find((e) => e.businessTitle === businessTitle) || null;
            setEnrollment(current);

            if (!current?.examPassed) {
                const q = await fetchExamQuestions(businessTitle).catch(() => []);
                setQuestions(q);
                if (q.length > 0) setSecondsLeft(q.length * SECONDS_PER_QUESTION);
            }
            setLoading(false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessTitle, navigate]);

    // Countdown timer - auto-submits when it hits zero.
    useEffect(() => {
        if (secondsLeft === null || result || submittedRef.current) return;
        if (secondsLeft <= 0) {
            submittedRef.current = true;
            handleSubmit(true);
            return;
        }
        const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, result]);

    function selectAnswer(questionId, optionIndex) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }

    function toggleReview(questionId) {
        setMarkedForReview((prev) =>
            prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
        );
    }

    async function handleSubmit(auto = false) {
        if (!auto && Object.keys(answers).length < questions.length) {
            if (!confirm("You haven't answered all questions. Submit anyway?")) return;
        }

        setSubmitting(true);
        try {
            const res = await submitExam({ businessTitle, skill, answers });
            setResult(res);
            if (auto) toast.info("Time's up! Your exam was submitted automatically.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not submit the exam.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!canTakeExam) {
        return (
            <div className="exam-page">
                <h1>Final Exam</h1>
                <div className="exam-no-questions">
                    Please complete the above two (watch all mentor resources and finish 100% of the roadmap) before taking the final exam.
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                        {hasLearningResources && !resourcesCompleted && (
                            <button className="exam-submit-btn" onClick={() => navigate("/learning-resources")}>Go to Resources</button>
                        )}
                        {roadmapProgress < 100 && (
                            <button className="exam-submit-btn" onClick={() => navigate("/business-roadmap")}>Go to Roadmap</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div className="exam-page">Loading exam...</div>;

    // Already passed on an earlier visit - don't show the exam again.
    if (enrollment?.examPassed && !result) {
        return (
            <div className="exam-page">
                <h1>Final Exam</h1>
                <div className="exam-result-card passed">
                    <h2>Your exam is complete!</h2>
                    <div className="exam-result-score">{enrollment.examScore} / {enrollment.examTotal}</div>
                    <p>Please proceed to the Interview step.</p>
                    <button className="exam-submit-btn" onClick={() => navigate("/interview")} style={{ marginTop: 20 }}>
                        Go to Interview
                    </button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="exam-page">
                <div className={`exam-result-card ${result.passed ? "passed" : "failed"}`}>
                    <h2>{result.passed ? "Congratulations! You passed." : "You didn't pass this time."}</h2>
                    <div className="exam-result-score">{result.score} / {result.total}</div>
                    <p>{result.passed
                        ? "Great work! Head to the Interview step to see your status and get your Google Meet link once it's scheduled."
                        : "Review the resources and roadmap again, then retake the exam when you're ready."
                    }</p>
                    <button className="exam-submit-btn" onClick={() => navigate(result.passed ? "/interview" : "/dashboard")} style={{ marginTop: 20 }}>
                        {result.passed ? "Go to Interview" : "Back to Dashboard"}
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="exam-page">
                <h1>Final Exam</h1>
                <div className="exam-no-questions">
                    Your mentor hasn't published a question paper for <strong>{businessTitle}</strong> yet. Please check back later.
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const progressPercent = Math.round((answeredCount / questions.length) * 100);
    const currentQuestion = questions[currentIndex];
    const isLowTime = secondsLeft !== null && secondsLeft <= 30;

    function questionStatus(idx, q) {
        if (idx === currentIndex) return "current";
        if (markedForReview.includes(q.id)) return "review";
        if (answers[q.id] !== undefined) return "answered";
        return "unanswered";
    }

    return (
        <div className="exam-page exam-page-wide">
            <div className="exam-top-bar">
                <div>
                    <h1>Final Exam</h1>
                    <p>{businessTitle} - you need 75% to pass.</p>
                </div>
                <div className={`exam-timer ${isLowTime ? "low-time" : ""}`}>
                    ⏱ {formatTime(Math.max(secondsLeft, 0))}
                </div>
            </div>

            <div className="exam-progress-bar-track">
                <div className="exam-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="exam-progress-label">{answeredCount} of {questions.length} answered</p>

            <div className="exam-body-layout">
                <div className="exam-question-card">
                    <h4>{currentIndex + 1}. {currentQuestion.question}</h4>
                    {currentQuestion.options.map((option, i) => (
                        <div
                            key={i}
                            className={answers[currentQuestion.id] === i ? "exam-option selected" : "exam-option"}
                            onClick={() => selectAnswer(currentQuestion.id, i)}
                        >
                            <input type="radio" checked={answers[currentQuestion.id] === i} readOnly />
                            {option}
                        </div>
                    ))}

                    <div className="exam-nav-buttons">
                        <button
                            className="exam-nav-btn"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((i) => i - 1)}
                        >
                            ← Previous
                        </button>
                        <button className="exam-review-btn" onClick={() => toggleReview(currentQuestion.id)}>
                            {markedForReview.includes(currentQuestion.id) ? "Unmark Review" : "Mark for Review"}
                        </button>
                        {currentIndex < questions.length - 1 ? (
                            <button className="exam-nav-btn" onClick={() => setCurrentIndex((i) => i + 1)}>
                                Next →
                            </button>
                        ) : (
                            <button className="exam-submit-btn" onClick={() => handleSubmit(false)} disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit Exam"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="exam-palette">
                    <h4>Questions</h4>
                    <div className="exam-palette-grid">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                className={`palette-item ${questionStatus(idx, q)}`}
                                onClick={() => setCurrentIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    <div className="palette-legend">
                        <span><i className="dot answered" /> Answered</span>
                        <span><i className="dot review" /> For Review</span>
                        <span><i className="dot unanswered" /> Unanswered</span>
                    </div>
                    <button className="exam-submit-btn" onClick={() => handleSubmit(false)} disabled={submitting} style={{ width: "100%", marginTop: 14 }}>
                        {submitting ? "Submitting..." : "Submit Exam"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamPage;
