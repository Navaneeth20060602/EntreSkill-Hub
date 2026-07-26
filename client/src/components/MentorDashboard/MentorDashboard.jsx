import "./MentorDashboard.css";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    fetchMyMentorProfile,
    updateMyMentorProfile,
    addMyResource,
    updateMyResource,
    deleteMyResource,
    fetchMyStudents,
} from "../../services/mentorService";
import { fetchMyThreadsAsMentor, fetchMessagesWithUser, sendMessageToUser } from "../../services/chatService";
import {
    addQuestion, deleteQuestion,
    createPaper, fetchMyPapers, deletePaper, assignPaperToStudent,
    scheduleInterview, recordInterviewResult,
} from "../../services/examService";
import { fetchMyAssignedComplaints, addMentorNoteToComplaint } from "../../services/contactService";
import { API_ORIGIN } from "../../services/api";
import { getBusinessesForSkill } from "../../utils/businessHelpers";
import ChatWindow from "../Chat/ChatWindow";
import ChangePassword from "../ChangePassword/ChangePassword";
import { toast } from "../../context/ToastContext";
import EmptyState from "../EmptyState/EmptyState";
import Skeleton from "../Skeleton/Skeleton";
import SearchBar from "../Search/Search";
import {
    PartyPopper, ArrowRight, Star, Circle, Square, CheckCircle2, Film,
    GraduationCap, Mail, Shield, FileText, FileEdit, FolderOpen, X, MessageSquare,
} from "lucide-react";

function MentorDashboard() {
    const { user, logout } = useAuth();
    const [mentor, setMentor] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [students, setStudents] = useState([]);
    const [pendingComplaints, setPendingComplaints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("resources");

    useEffect(() => {
        async function load() {
            try {
                const { mentor, feedbacks } = await fetchMyMentorProfile();
                setMentor(mentor);
                setFeedbacks(feedbacks);
                const myStudents = await fetchMyStudents().catch(() => []);
                setStudents(myStudents);
                const myComplaints = await fetchMyAssignedComplaints().catch(() => []);
                setPendingComplaints(myComplaints.filter((c) => !c.mentorNote).length);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "No mentor profile is linked to this account yet. Ask the admin to link your login to your mentor profile."
                );
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="mentor-dash"><Skeleton variant="dashboard" count={4} label="Loading your dashboard" /></div>;

    const subSkills = mentor ? getBusinessesForSkill(mentor.specialization) : [];

    const upcomingInterviews = students.filter((s) =>
        s.enrollments?.some((e) => e.interviewStatus === "SCHEDULED")
    ).length;

    const pendingPaperAssignments = students.filter((s) =>
        s.enrollments?.some((e) => e.examScore === null && !e.assignedPaperId)
    ).length;

    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const today = new Date();
    const interviewsToday = students
        .flatMap((s) => s.enrollments || [])
        .filter((e) => e.interviewStatus === "SCHEDULED" && e.interviewScheduledAt && isSameDay(new Date(e.interviewScheduledAt), today))
        .length;

    const pendingResourceApprovals = mentor?.resources?.filter((r) => !r.approved).length || 0;

    const priorities = [
        pendingPaperAssignments > 0 && {
            key: "papers", tab: "exams",
            text: `${pendingPaperAssignments} student${pendingPaperAssignments > 1 ? "s" : ""} awaiting paper assignment`,
        },
        interviewsToday > 0 && {
            key: "interviews", tab: "exams",
            text: `${interviewsToday} interview${interviewsToday > 1 ? "s" : ""} today`,
        },
        pendingResourceApprovals > 0 && {
            key: "resources", tab: "resources",
            text: `${pendingResourceApprovals} resource${pendingResourceApprovals > 1 ? "s" : ""} pending admin approval`,
        },
        pendingComplaints > 0 && {
            key: "complaints", tab: "complaints",
            text: `${pendingComplaints} assigned complaint${pendingComplaints > 1 ? "s" : ""} awaiting your note`,
        },
    ].filter(Boolean);

    return (
        <div className="mentor-dash">

            <div className="mentor-dash-header">
                {mentor?.photo ? (
                    <img src={`${API_ORIGIN}${mentor.photo}`} alt={mentor.name} />
                ) : (
                    <div className="avatar-fallback">{(mentor?.name || user?.fullName || "M")[0]}</div>
                )}
                <div>
                    <h2>Welcome, {mentor?.name || "Mentor"}</h2>
                    <p>{mentor?.specialization ? `${mentor.specialization} Mentor` : "Mentor Dashboard"}</p>
                </div>
            </div>

            {error && (
                <div className="mentor-section">
                    <p>{error}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            )}

            {mentor && (
                <>
                    <div className="mentor-priorities">
                        <h3>What needs your attention today</h3>
                        {priorities.length === 0 ? (
                            <p className="empty-note">Nothing urgent right now — you're all caught up. <PartyPopper size={16} className="inline-icon" /></p>
                        ) : (
                            <ul>
                                {priorities.map((p) => (
                                    <li key={p.key} onClick={() => setTab(p.tab)}>
                                        <span className="priority-dot" />
                                        {p.text}
                                        <span className="priority-arrow"><ArrowRight size={16} /></span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mentor-stats">
                        <div className="mentor-stat-card">
                            <div className="value">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "No ratings yet"}</div>
                            <div className="label">Average Rating (auto-calculated)</div>
                        </div>
                        <div className="mentor-stat-card">
                            <div className="value">{mentor.resources?.length || 0}</div>
                            <div className="label">Resources Shared</div>
                        </div>
                        <div className="mentor-stat-card">
                            <div className="value">{feedbacks.length}</div>
                            <div className="label">Feedback Received</div>
                        </div>
                        <div className="mentor-stat-card">
                            <div className="value">{upcomingInterviews}</div>
                            <div className="label">Upcoming Interviews</div>
                        </div>
                        <div className="mentor-stat-card">
                            <div className="value">{pendingPaperAssignments}</div>
                            <div className="label">Awaiting Paper Assignment</div>
                        </div>
                    </div>

                    <div className="mentor-tabs">
                        <button className={tab === "resources" ? "active" : ""} onClick={() => setTab("resources")}>Resources</button>
                        <button className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>My Students</button>
                        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}>Messages</button>
                        <button className={tab === "exams" ? "active" : ""} onClick={() => setTab("exams")}>Exams & Interviews</button>
                        <button className={tab === "complaints" ? "active" : ""} onClick={() => setTab("complaints")}>Assigned Complaints</button>
                        <button className={tab === "feedback" ? "active" : ""} onClick={() => setTab("feedback")}>Feedback</button>
                        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>My Profile</button>
                    </div>

                    {tab === "resources" && (
                        <ResourcesTab mentor={mentor} setMentor={setMentor} subSkills={subSkills} />
                    )}

                    {tab === "students" && <StudentsTab />}

                    {tab === "messages" && <MessagesTab />}

                    {tab === "exams" && <ExamsTab subSkills={subSkills} skill={mentor.specialization} students={students} />}

                    {tab === "complaints" && <ComplaintsTab />}

                    {tab === "feedback" && (
                        <div className="mentor-section">
                            <h3>Feedback From Learners</h3>
                            {feedbacks.length ? (
                                feedbacks.map((f) => (
                                    <div className="feedback-item" key={f.id}>
                                        <div className="stars">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={14} className={i < f.rating ? "star-filled" : "star-empty"} />
                                            ))}
                                        </div>
                                        <p>{f.message}</p>
                                        <small>— Anonymous learner</small>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<MessageSquare size={28} />} message="No feedback yet. Ratings and comments from your learners will show up here." />
                            )}
                        </div>
                    )}

                    {tab === "profile" && <ProfileTab mentor={mentor} setMentor={setMentor} />}
                </>
            )}

        </div>
    );
}

function VideoRecorder({ onRecorded }) {
    const videoRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const chunks = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const file = new File([blob], `recording-${Date.now()}.webm`, { type: "video/webm" });
            setPreviewUrl(URL.createObjectURL(blob));
            onRecorded(file);
            stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorder.start();
        setRecorder(mediaRecorder);
        setRecording(true);
    }

    function stopRecording() {
        recorder?.stop();
        setRecording(false);
    }

    return (
        <div className="video-recorder">
            {!previewUrl && <video ref={videoRef} muted className="recorder-preview" />}
            {previewUrl && <video src={previewUrl} controls className="recorder-preview" />}
            <div className="recorder-controls">
                {!recording ? (
                    <button type="button" onClick={startRecording}>
                        {previewUrl ? "Re-record" : <><Circle size={14} fill="currentColor" /> Start Recording</>}
                    </button>
                ) : (
                    <button type="button" onClick={stopRecording} className="stop-btn"><Square size={14} fill="currentColor" /> Stop Recording</button>
                )}
            </div>
        </div>
    );
}

function ResourcesTab({ mentor, setMentor, subSkills }) {
    const [form, setForm] = useState({ title: "", url: "", noteText: "", description: "", businessTitle: subSkills[0]?.title || "", contentType: "video" });
    const [uploadMode, setUploadMode] = useState("upload"); // "upload" | "record" | "url"
    const [videoFile, setVideoFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    async function handleAddResource(e) {
        e.preventDefault();
        if (!form.title || !form.businessTitle) {
            toast.error("Title and sub-skill are required.");
            return;
        }
        if (form.contentType !== "notes" && !videoFile && !form.url) {
            toast.error("Upload, record, or paste a URL for the video.");
            return;
        }
        if (form.contentType === "notes" && !videoFile && !form.noteText) {
            toast.error("Add a notes file or write your notes text.");
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("businessTitle", form.businessTitle);
            fd.append("description", form.description);
            fd.append("contentType", form.contentType);
            if (form.contentType === "notes") fd.append("noteText", form.noteText);
            if (videoFile) fd.append("file", videoFile);
            else fd.append("url", form.url);

            if (editingId) {
                const updated = await updateMyResource(editingId, fd);
                setMentor((prev) => ({
                    ...prev,
                    resources: prev.resources.map((r) => (r.id === editingId ? updated : r)),
                }));
                setEditingId(null);
            } else {
                const resource = await addMyResource(fd);
                setMentor((prev) => ({ ...prev, resources: [resource, ...(prev.resources || [])] }));
            }
            setForm({ title: "", url: "", noteText: "", description: "", businessTitle: subSkills[0]?.title || "", contentType: "video" });
            setVideoFile(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save resource.");
        } finally {
            setSaving(false);
        }
    }

    function startEdit(r) {
        setEditingId(r.id);
        setForm({
            title: r.title,
            url: r.contentType === "link" ? r.url : "",
            noteText: r.noteText || "",
            description: r.description || "",
            businessTitle: r.businessTitle || subSkills[0]?.title || "",
            contentType: r.contentType || "video",
        });
        setVideoFile(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDeleteResource(id) {
        if (!confirm("Remove this resource?")) return;
        await deleteMyResource(id);
        setMentor((prev) => ({ ...prev, resources: prev.resources.filter((r) => r.id !== id) }));
    }

    return (
        <div className="mentor-section">
            <h3>{editingId ? "Edit Resource" : "Share a Resource"}</h3>
            <p className="tab-hint">
                Resources are scoped to one specific course under {subSkills[0]?.skill || "your specialization"} - learners only see resources for the course they picked.
            </p>
            <form className="resource-form" onSubmit={handleAddResource}>
                <input
                    placeholder="Resource title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <select
                    value={form.businessTitle}
                    onChange={(e) => setForm({ ...form, businessTitle: e.target.value })}
                >
                    {subSkills.map((b) => <option key={b.id} value={b.title}>{b.title}</option>)}
                </select>

                <select
                    className="full"
                    value={form.contentType}
                    onChange={(e) => { setForm({ ...form, contentType: e.target.value }); setVideoFile(null); }}
                >
                    <option value="video">Video Lesson</option>
                    <option value="link">External Link (e.g. YouTube)</option>
                    <option value="notes">Written Notes / Document</option>
                </select>

                {form.contentType === "video" && (
                    <div className="full">
                        <div className="upload-mode-tabs">
                            <button type="button" className={uploadMode === "upload" ? "active" : ""} onClick={() => setUploadMode("upload")}>Upload File</button>
                            <button type="button" className={uploadMode === "record" ? "active" : ""} onClick={() => setUploadMode("record")}>Record Now</button>
                        </div>
                        {uploadMode === "upload" ? (
                            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
                        ) : (
                            <VideoRecorder onRecorded={setVideoFile} />
                        )}
                    </div>
                )}

                {form.contentType === "link" && (
                    <input
                        className="full"
                        placeholder="Video/resource URL (e.g. YouTube link)"
                        value={form.url}
                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                    />
                )}

                {form.contentType === "notes" && (
                    <>
                        <input type="file" accept=".pdf,.doc,.docx" className="full" onChange={(e) => setVideoFile(e.target.files[0])} />
                        <textarea
                            className="full"
                            placeholder="Or write your notes here directly..."
                            rows="4"
                            value={form.noteText}
                            onChange={(e) => setForm({ ...form, noteText: e.target.value })}
                        />
                    </>
                )}

                <input
                    className="full"
                    placeholder="Short description (optional)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <button type="submit" disabled={saving} className="full">
                    {saving ? "Saving..." : editingId ? "Update Resource" : "Add Resource"}
                </button>
            </form>

            {mentor.resources?.length ? (
                mentor.resources.map((r) => (
                    <div className="resource-list-item" key={r.id}>
                        <div>
                            {r.contentType === "notes" ? (
                                <strong>{r.title}</strong>
                            ) : (
                                <a href={r.contentType === "video" ? `${API_ORIGIN}${r.url}` : r.url} target="_blank" rel="noreferrer">{r.title}</a>
                            )}
                            {r.businessTitle && <span> — {r.businessTitle}</span>}
                            <span className="resource-type-tag">{r.contentType}</span>
                            <span className={r.approved ? "resource-type-tag approved-tag" : r.rejected ? "resource-type-tag rejected-tag" : "resource-type-tag pending-tag"}>
                                {r.approved ? <><CheckCircle2 size={13} /> Approved</> : r.rejected ? "Rejected" : "Pending Approval"}
                            </span>
                            {r.rejected && r.rejectionReason && (
                                <p style={{ fontSize: 13, color: "#B91C1C", marginTop: 4 }}>
                                    <strong>Admin's reason:</strong> {r.rejectionReason} — edit and resave this resource to resubmit it for approval.
                                </p>
                            )}
                            {r.ratingCount > 0 && <span className="resource-type-tag"><Star size={13} className="star-filled" /> {r.averageRating} ({r.ratingCount})</span>}
                        </div>
                        <div>
                            <button onClick={() => startEdit(r)} style={{ background: "#DBEAFE", color: "#1D4ED8", marginRight: 8 }}>Edit</button>
                            <button onClick={() => handleDeleteResource(r.id)}>Remove</button>
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState icon={<Film size={28} />} message="You haven't shared any resources yet. Add a video, link, or notes to get your students started." />
            )}
        </div>
    );
}

function StudentsTab() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchMyStudents().then(setStudents).finally(() => setLoading(false));
    }, []);

    function copyId(id) {
        navigator.clipboard.writeText(id);
        toast.info("Student ID copied to clipboard.");
    }

    if (loading) return <div className="mentor-section"><Skeleton variant="table" count={4} label="Loading students" /></div>;

    const q = query.trim().toLowerCase();
    const filteredStudents = q
        ? students.filter((s) => s.fullName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
        : students;

    return (
        <div className="mentor-section">
            <h3>My Students</h3>
            <p className="tab-hint">Learners automatically assigned to you based on their skill.</p>

            {students.length > 0 && (
                <SearchBar value={query} onChange={setQuery} placeholder="Search students by name or email..." label="Search students" />
            )}

            {students.length === 0 ? (
                <EmptyState icon={<GraduationCap size={28} />} message="No students assigned to you yet. New learners appear here once they're auto-matched to you." />
            ) : filteredStudents.length === 0 ? (
                <EmptyState icon={<GraduationCap size={28} />} message={`No students match "${query}".`} actionLabel="Clear search" onAction={() => setQuery("")} />
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Student ID</th><th>Course</th><th>Exam</th><th>Interview</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s) => {
                            const enrollment = s.enrollments?.[0];
                            return (
                                <tr key={s.id}>
                                    <td>{s.fullName}</td>
                                    <td style={{ fontSize: 12 }}>{s.email}</td>
                                    <td>
                                        <button
                                            onClick={() => copyId(s.id)}
                                            style={{ fontSize: 11, color: "#2563EB", background: "none", border: "1px solid #DBEAFE", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                                            title={s.id}
                                        >
                                            Copy ID
                                        </button>
                                    </td>
                                    <td>{enrollment?.businessTitle || s.progress?.primarySkill || "Not started"}</td>
                                    <td>{enrollment?.examScore !== undefined && enrollment?.examScore !== null ? `${enrollment.examScore}/${enrollment.examTotal}` : "-"}</td>
                                    <td>{enrollment?.interviewScore !== undefined && enrollment?.interviewScore !== null ? `${enrollment.interviewScore}/100` : "-"}</td>
                                    <td>
                                        {enrollment ? (
                                            <span className={`role-badge ${enrollment.status === "COMPLETED" ? "MENTOR" : "USER"}`}>
                                                {enrollment.status.replace("_", " ")}
                                            </span>
                                        ) : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function MessagesTab() {
    const [threads, setThreads] = useState([]);
    const [activeUserId, setActiveUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyThreadsAsMentor().then((t) => {
            setThreads(t);
            if (t.length > 0) setActiveUserId(t[0].userId);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="mentor-section"><Skeleton variant="table" count={4} label="Loading messages" /></div>;

    if (threads.length === 0) {
        return <div className="mentor-section"><EmptyState icon={<Mail size={28} />} message="No learners have messaged you yet." /></div>;
    }

    const active = threads.find((t) => t.userId === activeUserId);

    return (
        <div className="mentor-section messages-tab">
            <div className="thread-list">
                {threads.map((t) => (
                    <div
                        key={t.userId}
                        className={t.userId === activeUserId ? "thread-item active" : "thread-item"}
                        onClick={() => setActiveUserId(t.userId)}
                    >
                        <strong>{t.name} {t.isAdmin && <span className="admin-thread-badge"><Shield size={12} /> Admin</span>}</strong>
                        <p>{t.lastMessage}</p>
                    </div>
                ))}
            </div>
            <div className="thread-chat">
                {active && (
                    <ChatWindow
                        key={active.userId}
                        title={active.name}
                        subtitle="Learner"
                        photo={active.photo ? `${API_ORIGIN}${active.photo}` : null}
                        myRole="MENTOR"
                        fetchMessages={() => fetchMessagesWithUser(active.userId)}
                        sendMessage={(text) => sendMessageToUser(active.userId, text)}
                    />
                )}
            </div>
        </div>
    );
}

function ExamsTab({ subSkills, skill, students: initialStudents }) {
    const [businessTitle, setBusinessTitle] = useState(subSkills[0]?.title || "");
    const [papers, setPapers] = useState([]);
    const [activePaperId, setActivePaperId] = useState("");
    const [loading, setLoading] = useState(true);
    const [newPaperTitle, setNewPaperTitle] = useState("");
    const [form, setForm] = useState({ question: "", options: ["", "", "", ""], correctIndex: 0 });
    const [saving, setSaving] = useState(false);

    // Assignment + interview form
    const [studentId, setStudentId] = useState("");
    const [interviewForm, setInterviewForm] = useState({ meetLink: "", scheduledAt: "", score: "" });
    const [students, setStudents] = useState(initialStudents || []);

    useEffect(() => {
        if (!businessTitle) return;
        fetchMyPapers(businessTitle).then((p) => {
            setPapers(p);
            setActivePaperId(p[0]?.id || "");
        }).finally(() => setLoading(false));
    }, [businessTitle]);

    // Refresh the roster after any assign/schedule/record action so the
    // lookup below immediately reflects the new status - otherwise a
    // mentor acting twice in a row on the same student would still be
    // looking at stale, pre-action data.
    async function refreshStudents() {
        try {
            const list = await fetchMyStudents();
            setStudents(list);
        } catch {
            // Non-fatal - the next full dashboard load will pick it up.
        }
    }

    const questions = papers.find((p) => p.id === activePaperId)?.questions || [];

    // The learner's current enrollment for the course selected above, if
    // the typed-in ID matches one of this mentor's students. This is what
    // lets the UI tell the difference between "not started yet",
    // "already passed the exam", "interview already scheduled", and
    // "interview already passed" - instead of blindly re-running the
    // action every time the button is clicked.
    const lookedUpStudent = studentId ? students.find((s) => s.id === studentId) : null;
    const studentEnrollment = lookedUpStudent?.enrollments?.find((e) => e.businessTitle === businessTitle) || null;

    const examAlreadyPassed = Boolean(studentEnrollment?.examPassed);
    const interviewAlreadyPassed = Boolean(studentEnrollment?.interviewPassed);
    const interviewAlreadyScheduled = studentEnrollment?.interviewStatus === "SCHEDULED";

    async function handleCreatePaper(e) {
        e.preventDefault();
        if (!newPaperTitle) return;
        const created = await createPaper({ businessTitle, title: newPaperTitle });
        setPapers((prev) => [{ ...created, questions: [] }, ...prev]);
        setActivePaperId(created.id);
        setNewPaperTitle("");
    }

    async function handleDeletePaper(id) {
        if (!confirm("Delete this paper and all its questions?")) return;
        await deletePaper(id);
        setPapers((prev) => prev.filter((p) => p.id !== id));
        if (activePaperId === id) setActivePaperId("");
    }

    async function handleAddQuestion(e) {
        e.preventDefault();
        if (!activePaperId) { toast.error("Create or select a paper first."); return; }
        if (!form.question || form.options.some((o) => !o)) {
            toast.error("Fill in the question and all 4 options.");
            return;
        }
        setSaving(true);
        try {
            const created = await addQuestion({ businessTitle, paperId: activePaperId, question: form.question, options: form.options, correctIndex: form.correctIndex });
            setPapers((prev) => prev.map((p) => (p.id === activePaperId ? { ...p, questions: [...p.questions, created] } : p)));
            setForm({ question: "", options: ["", "", "", ""], correctIndex: 0 });
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not add question.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteQuestion(id) {
        if (!confirm("Remove this question?")) return;
        await deleteQuestion(id);
        setPapers((prev) => prev.map((p) => (p.id === activePaperId ? { ...p, questions: p.questions.filter((q) => q.id !== id) } : p)));
    }

    async function handleAssignPaper() {
        if (!studentId || !activePaperId) {
            toast.error("Enter the student's ID and select a paper.");
            return;
        }
        if (examAlreadyPassed) {
            toast.error("This student has already completed and passed the exam for this course.");
            return;
        }
        try {
            await assignPaperToStudent({ userId: studentId, businessTitle, skill, paperId: activePaperId });
            toast.success("Paper assigned to student.");
            refreshStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not assign paper.");
        }
    }

    async function handleScheduleInterview() {
        if (!studentId || !interviewForm.meetLink) {
            toast.error("Enter the student's ID and a Google Meet link.");
            return;
        }
        if (interviewAlreadyPassed) {
            toast.error("This student has already passed their interview for this course.");
            return;
        }
        if (interviewAlreadyScheduled && !confirm("This student already has an interview scheduled. Reschedule it with the new link/time?")) {
            return;
        }
        try {
            const enrollment = await scheduleInterview({ userId: studentId, businessTitle, skill, meetLink: interviewForm.meetLink, scheduledAt: interviewForm.scheduledAt || undefined });
            toast.success(interviewAlreadyScheduled ? "Interview rescheduled. The learner will see the update in their dashboard." : "Interview scheduled. The learner will see this in their dashboard.");
            refreshStudents();
            return enrollment;
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not schedule interview.");
        }
    }

    async function handleRecordInterviewResult() {
        if (!studentId) {
            toast.error("Enter the student's ID.");
            return;
        }
        if (interviewForm.score === "" || interviewForm.score === undefined || interviewForm.score === null) {
            toast.error("Enter the interview marks (out of 100) before saving.");
            return;
        }
        try {
            const enrollment = await recordInterviewResult({
                userId: studentId, businessTitle, skill,
                score: Number(interviewForm.score),
                meetLink: interviewForm.meetLink,
            });
            toast.success(enrollment.interviewPassed ? "Interview passed!" : "Interview result saved - not passed.");
            setInterviewForm({ ...interviewForm, score: "" });
            refreshStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save interview result.");
        }
    }

    return (
        <div className="mentor-section">
            <h3>Exams & Interviews</h3>
            <p className="tab-hint">
                Create multiple question papers per course, then assign exactly one to each student. Interviews happen over Google Meet - share the link and later record the result here.
            </p>

            <select value={businessTitle} onChange={(e) => setBusinessTitle(e.target.value)} className="exam-course-select">
                {subSkills.map((b) => <option key={b.id} value={b.title}>{b.title}</option>)}
            </select>

            <div className="paper-panel">
                <div className="paper-list">
                    <form onSubmit={handleCreatePaper} className="paper-create-form">
                        <input placeholder="New paper name (e.g. Set A)" value={newPaperTitle} onChange={(e) => setNewPaperTitle(e.target.value)} />
                        <button type="submit">+ Create</button>
                    </form>
                    {loading ? <Skeleton variant="table" count={3} label="Loading papers" /> : papers.length === 0 ? (
                        <EmptyState icon={<FileText size={28} />} message="No papers yet for this course. Create one to start assigning exams." compact />
                    ) : (
                        papers.map((p) => (
                            <div key={p.id} className={p.id === activePaperId ? "paper-item active" : "paper-item"} onClick={() => setActivePaperId(p.id)}>
                                <span>{p.title} ({p.questions?.length || 0} Qs)</span>
                                <button aria-label="Delete paper" onClick={(e) => { e.stopPropagation(); handleDeletePaper(p.id); }}><X size={14} /></button>
                            </div>
                        ))
                    )}
                </div>

                <div className="paper-questions">
                    {activePaperId ? (
                        <>
                            <form className="question-form" onSubmit={handleAddQuestion}>
                                <input
                                    className="full"
                                    placeholder="Question"
                                    value={form.question}
                                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                                />
                                {form.options.map((opt, i) => (
                                    <div key={i} className="option-row">
                                        <input
                                            type="radio"
                                            checked={form.correctIndex === i}
                                            onChange={() => setForm({ ...form, correctIndex: i })}
                                        />
                                        <input
                                            placeholder={`Option ${i + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const options = [...form.options];
                                                options[i] = e.target.value;
                                                setForm({ ...form, options });
                                            }}
                                        />
                                    </div>
                                ))}
                                <button type="submit" disabled={saving} className="full">
                                    {saving ? "Adding..." : "Add Question"}
                                </button>
                            </form>

                            {questions.map((q, idx) => (
                                <div className="resource-list-item" key={q.id}>
                                    <div>
                                        <strong>{idx + 1}. {q.question}</strong>
                                        <p style={{ fontSize: 13, color: "#6B7280" }}>Correct: {q.options[q.correctIndex]}</p>
                                    </div>
                                    <button onClick={() => handleDeleteQuestion(q.id)}>Remove</button>
                                </div>
                            ))}
                        </>
                    ) : (
                        <EmptyState icon={<FileEdit size={28} />} message="Select or create a paper to add questions." compact />
                    )}
                </div>
            </div>

            <div className="mentor-section" style={{ boxShadow: "none", padding: "20px 0 0", marginTop: 20, borderTop: "1px solid #F3F4F6" }}>
                <h4>Assign Paper / Schedule Interview / Record Result</h4>
                <p className="tab-hint">Find the student's ID from the "My Students" tab.</p>

                {studentId && (
                    lookedUpStudent ? (
                        <p className="tab-hint" style={{ background: "#F3F4F6", padding: "8px 12px", borderRadius: 8 }}>
                            <strong>{lookedUpStudent.fullName}</strong> · {businessTitle}:{" "}
                            {!studentEnrollment && "not enrolled in this course yet"}
                            {studentEnrollment && examAlreadyPassed && interviewAlreadyPassed && "exam & interview already passed"}
                            {studentEnrollment && examAlreadyPassed && !interviewAlreadyPassed && interviewAlreadyScheduled && "exam passed, interview scheduled"}
                            {studentEnrollment && examAlreadyPassed && !interviewAlreadyPassed && !interviewAlreadyScheduled && "exam passed, interview not scheduled yet"}
                            {studentEnrollment && !examAlreadyPassed && "exam not passed yet"}
                        </p>
                    ) : (
                        <p className="tab-hint" style={{ color: "#B91C1C" }}>No student with that ID found among your assigned students.</p>
                    )
                )}

                <div className="resource-form">
                    <input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                    <button type="button" onClick={handleAssignPaper} disabled={examAlreadyPassed} title={examAlreadyPassed ? "This student already passed the exam for this course." : undefined}>
                        {examAlreadyPassed ? "Exam Already Completed" : "Assign Selected Paper"}
                    </button>

                    <input placeholder="Google Meet link" value={interviewForm.meetLink} onChange={(e) => setInterviewForm({ ...interviewForm, meetLink: e.target.value })} />
                    <input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} />
                    <button type="button" onClick={handleScheduleInterview} disabled={interviewAlreadyPassed} title={interviewAlreadyPassed ? "This student already passed their interview." : interviewAlreadyScheduled ? "An interview is already scheduled - this will reschedule it." : undefined}>
                        {interviewAlreadyPassed ? "Interview Already Completed" : interviewAlreadyScheduled ? "Reschedule Interview" : "Schedule Interview"}
                    </button>

                    <input placeholder="Interview score (out of 100)" type="number" min="0" max="100" value={interviewForm.score} onChange={(e) => setInterviewForm({ ...interviewForm, score: e.target.value })} />
                    <p className="tab-hint" style={{ margin: "-6px 0 6px" }}>Pass/fail is decided automatically: more than 60/100 marks passes.</p>
                    <button type="button" onClick={handleRecordInterviewResult} className="full" disabled={interviewAlreadyPassed} title={interviewAlreadyPassed ? "This student already passed their interview." : undefined}>
                        {interviewAlreadyPassed ? "Interview Already Completed" : "Save Interview Result"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ComplaintsTab() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noteDraft, setNoteDraft] = useState({});

    useEffect(() => {
        fetchMyAssignedComplaints().then(setComplaints).finally(() => setLoading(false));
    }, []);

    async function handleSaveNote(id) {
        const note = noteDraft[id];
        if (!note) return;
        const updated = await addMentorNoteToComplaint(id, note);
        setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }

    if (loading) return <div className="mentor-section"><Skeleton variant="table" count={3} label="Loading assigned complaints" /></div>;

    return (
        <div className="mentor-section">
            <h3>Assigned Complaints</h3>
            <p className="tab-hint">
                The admin has forwarded these to you for input. The learner's identity is kept private - only the admin knows who raised it.
            </p>

            {complaints.length === 0 ? (
                <EmptyState icon={<FolderOpen size={28} />} message="No complaints have been assigned to you." />
            ) : (
                complaints.map((c) => (
                    <div className="resource-list-item" key={c.id} style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                        <div>
                            <strong>{c.subject}</strong>
                            <p style={{ fontSize: 14, color: "#4B5563" }}>{c.message}</p>
                        </div>
                        {c.mentorNote && (
                            <p style={{ fontSize: 13, color: "#15803D" }}><strong>Your note:</strong> {c.mentorNote}</p>
                        )}
                        <div style={{ display: "flex", gap: 8, width: "100%" }}>
                            <input
                                placeholder="Add a note back to the admin..."
                                style={{ flex: 1, padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8 }}
                                value={noteDraft[c.id] ?? c.mentorNote ?? ""}
                                onChange={(e) => setNoteDraft({ ...noteDraft, [c.id]: e.target.value })}
                            />
                            <button onClick={() => handleSaveNote(c.id)}>Save Note</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function ProfileTab({ mentor, setMentor }) {
    const [form, setForm] = useState({ bio: mentor.bio || "", experience: mentor.experience || "", location: mentor.location || "" });
    const [photoFile, setPhotoFile] = useState(null);
    const [saving, setSaving] = useState(false);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (photoFile) fd.append("photo", photoFile);
            const updated = await updateMyMentorProfile(fd);
            setMentor((prev) => ({ ...prev, ...updated }));
            toast.success("Profile updated.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update profile.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mentor-section">
            <h3>My Profile</h3>
            <form className="resource-form" onSubmit={handleSave}>
                <input placeholder="Experience (e.g. 8 Years)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <input type="file" accept="image/*" aria-label="Upload profile photo" onChange={(e) => setPhotoFile(e.target.files[0])} />
                <input className="full" placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                <button type="submit" disabled={saving} className="full">
                    {saving ? "Saving..." : "Save Profile"}
                </button>
            </form>

            <div style={{ marginTop: 24 }}>
                <ChangePassword />
            </div>
        </div>
    );
}

export default MentorDashboard;
