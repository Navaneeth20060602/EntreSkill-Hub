import "./AdminDashboard.css";
import { formatDate } from "../../utils/formatDate";
import { useEffect, useState } from "react";
import { fetchAllUsers, fetchAllFeedback, fetchStats, sendMentorLoginOtp, createMentorLogin, fetchAllCourses, createSubCourse, updateSubCourse, deleteSubCourse } from "../../services/adminService";
import { fetchMentors, createMentor, updateMentor, deleteMentor, fetchPendingResources, approveResource, rejectResource } from "../../services/mentorService";
import { fetchAllMessages, respondToMessage, closeTicket, transferMessageToMentor } from "../../services/contactService";
import { fetchAllCertificates, issueCertificate } from "../../services/certificateService";
import { fetchPendingApprovals, approveCompletion, fetchEnrollmentsForUser } from "../../services/examService";
import { fetchMessagesWithMentorAsAdmin, sendMessageToMentorAsAdmin } from "../../services/chatService";
import ChatWindow from "../Chat/ChatWindow";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import ChangePassword from "../ChangePassword/ChangePassword";
import { API_ORIGIN } from "../../services/api";
import { toast } from "../../context/ToastContext";
import EmptyState from "../EmptyState/EmptyState";
import ComplaintTimeline from "../ComplaintTimeline/ComplaintTimeline";
import SearchBar from "../Search/Search";
import Skeleton from "../Skeleton/Skeleton";
import {
    Star, X, XCircle, MessageSquare, FolderOpen, Mail, Film, CheckCircle, Trophy, ArrowRight, Users, Award,
} from "lucide-react";

const SKILLS = [
    "Cooking", "Tailoring", "Graphic Design", "Photography", "Teaching",
    "Carpentry", "Electrician", "Plumbing", "Mobile Repair", "Computer Skills",
    "Digital Marketing", "Handicrafts", "Agriculture", "Painting",
    "Content Writing", "Video Editing"
];

const emptyForm = { name: "", specialization: "", experience: "", location: "", email: "", phone: "", bio: "" };

function AdminDashboard() {
    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileModal, setProfileModal] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [photoFile, setPhotoFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [userQuery, setUserQuery] = useState("");
    const [complaintQuery, setComplaintQuery] = useState("");

    useEffect(() => {
        async function loadAll() {
            const [s, u, m, f, c, certs] = await Promise.all([
                fetchStats(), fetchAllUsers(), fetchMentors(), fetchAllFeedback(), fetchAllMessages(), fetchAllCertificates(),
            ]);
            setStats(s); setUsers(u); setMentors(m); setFeedback(f); setComplaints(c); setCertificates(certs);
            setLoading(false);
        }
        loadAll();
    }, []);

    function buildFormData() {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (photoFile) fd.append("photo", photoFile);
        return fd;
    }

    async function handleSaveMentor(e) {
        e.preventDefault();
        if (!form.name || !form.specialization || !form.email) {
            toast.error("Name, specialization and email are required.");
            return;
        }
        setSaving(true);
        try {
            const fd = buildFormData();
            if (editingId) {
                const updated = await updateMentor(editingId, fd);
                setMentors((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
            } else {
                const created = await createMentor(fd);
                setMentors((prev) => [created, ...prev]);
            }
            setForm(emptyForm);
            setPhotoFile(null);
            setEditingId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save mentor.");
        } finally {
            setSaving(false);
        }
    }

    function handleEditMentor(m) {
        setEditingId(m.id);
        setForm({
            name: m.name || "", specialization: m.specialization || "", experience: m.experience || "",
            location: m.location || "", email: m.email || "",
            phone: m.phone || "", bio: m.bio || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDeleteMentor(id) {
        if (!confirm("Remove this mentor from the directory?")) return;
        await deleteMentor(id);
        setMentors((prev) => prev.filter((m) => m.id !== id));
    }

    function handleRespond(updated) {
        setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }

    function handleClose(updated) {
        setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }

    function handleTransfer(updated) {
        setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }

    if (loading) return <div className="admin-dash"><Skeleton variant="dashboard" count={6} label="Loading admin dashboard" /></div>;

    const complaintTickets = complaints.filter((c) => c.type === "COMPLAINT");
    const feedbackTickets = complaints.filter((c) => c.type !== "COMPLAINT");

    return (
        <div className="admin-dash">
            <h2>Admin Dashboard</h2>
            <p>Manage users, mentors, feedback, complaints and certificates across EntreSkill Hub.</p>

            <div className="admin-stats">
                <div className="admin-stat-card">
                    <div className="value">{stats?.totalUsers ?? 0}</div>
                    <div className="label">Registered Users</div>
                </div>
                <div className="admin-stat-card">
                    <div className="value">{stats?.activeUsers ?? 0}</div>
                    <div className="label">Active Learners</div>
                </div>
                <div className="admin-stat-card">
                    <div className="value">{stats?.totalMentors ?? mentors.length}</div>
                    <div className="label">Mentors</div>
                </div>
                <div className="admin-stat-card">
                    <div className="value">{complaintTickets.filter((c) => c.status === "OPEN").length}</div>
                    <div className="label">Open Complaints</div>
                </div>
                <div className="admin-stat-card">
                    <div className="value">{stats?.certificatesIssued ?? 0}</div>
                    <div className="label">Certificates Issued</div>
                </div>
                <div className="admin-stat-card">
                    <div className="value">{stats?.avgMentorRating > 0 ? <><Star size={16} className="star-filled" /> {stats.avgMentorRating}</> : "-"}</div>
                    <div className="label">Avg Mentor Rating</div>
                </div>
            </div>

            <div className="admin-tabs">
                <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Users</button>
                <button className={tab === "mentors" ? "active" : ""} onClick={() => setTab("mentors")}>Mentors</button>
                <button className={tab === "feedback" ? "active" : ""} onClick={() => setTab("feedback")}>Feedback</button>
                <button className={tab === "complaints" ? "active" : ""} onClick={() => setTab("complaints")}>Complaints</button>
                <button className={tab === "certificates" ? "active" : ""} onClick={() => setTab("certificates")}>Approvals & Certificates</button>
                <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}>Message a Mentor</button>
                <button className={tab === "courses" ? "active" : ""} onClick={() => setTab("courses")}>Courses</button>
                <button className={tab === "account" ? "active" : ""} onClick={() => setTab("account")}>My Account</button>
            </div>

            <div className="admin-panel">
                {tab === "overview" && (() => {
                    const q = userQuery.trim().toLowerCase();
                    const filteredUsers = q
                        ? users.filter((u) =>
                            u.fullName?.toLowerCase().includes(q) ||
                            u.email?.toLowerCase().includes(q) ||
                            u.role?.toLowerCase().includes(q) ||
                            u.progress?.primarySkill?.toLowerCase().includes(q)
                        )
                        : users;

                    return (
                        <>
                            <SearchBar value={userQuery} onChange={setUserQuery} placeholder="Search users by name, email, role, or skill..." label="Search users" />

                            {filteredUsers.length === 0 ? (
                                <EmptyState icon={<Users size={28} />} message={`No users match "${userQuery}".`} actionLabel="Clear search" onAction={() => setUserQuery("")} />
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Skill</th><th></th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.fullName}</td>
                                                <td>{u.email}</td>
                                                <td>{u.mobile || "-"}</td>
                                                <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                                <td>{u.progress?.primarySkill || "Not selected"}</td>
                                                <td><button className="link-btn" onClick={() => setProfileModal(u)}>View Profile</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    );
                })()}

                {tab === "mentors" && (
                    <MentorsTab
                        form={form} setForm={setForm}
                        setPhotoFile={setPhotoFile}
                        editingId={editingId} saving={saving}
                        mentors={mentors} setMentors={setMentors}
                        handleSaveMentor={handleSaveMentor}
                        handleEditMentor={handleEditMentor}
                        handleDeleteMentor={handleDeleteMentor}
                        setProfileModal={setProfileModal}
                    />
                )}

                {tab === "feedback" && (
                    <>
                        {feedback.length > 0 && (
                            <>
                                <h4 className="section-subheading">Mentor Ratings</h4>
                                {feedback.map((f) => (
                                    <div className="admin-mentor-card" key={f.id}>
                                        <div className="info">
                                            <h4>{f.user?.fullName} {f.mentor ? <><ArrowRight size={14} className="inline-arrow-icon" /> {f.mentor.name}</> : ""}</h4>
                                            <p className="star-rating-line">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={14} className={i < f.rating ? "star-filled" : "star-empty"} />
                                                ))}
                                                {" "}— {f.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        <h4 className="section-subheading">Feedback & Suggestions</h4>
                        {feedbackTickets.length === 0 ? (
                            <EmptyState icon={<MessageSquare size={28} />} message="No feedback or suggestions yet." />
                        ) : (
                            feedbackTickets.map((c) => (
                                <TicketCard key={c.id} ticket={c} onRespond={handleRespond} onClose={handleClose} />
                            ))
                        )}
                    </>
                )}

                {tab === "complaints" && (() => {
                    const q = complaintQuery.trim().toLowerCase();
                    const filteredComplaints = q
                        ? complaintTickets.filter((c) =>
                            c.subject?.toLowerCase().includes(q) ||
                            c.message?.toLowerCase().includes(q) ||
                            c.user?.fullName?.toLowerCase().includes(q)
                        )
                        : complaintTickets;

                    if (complaintTickets.length === 0) {
                        return <EmptyState icon={<FolderOpen size={28} />} message="No complaints raised yet." />;
                    }

                    return (
                        <>
                            <SearchBar value={complaintQuery} onChange={setComplaintQuery} placeholder="Search complaints by subject, message, or user..." label="Search complaints" />
                            {filteredComplaints.length === 0 ? (
                                <EmptyState icon={<FolderOpen size={28} />} message={`No complaints match "${complaintQuery}".`} actionLabel="Clear search" onAction={() => setComplaintQuery("")} />
                            ) : (
                                filteredComplaints.map((c) => (
                                    <TicketCard key={c.id} ticket={c} onRespond={handleRespond} onClose={handleClose} onTransfer={handleTransfer} showTransfer />
                                ))
                            )}
                        </>
                    );
                })()}

                {tab === "certificates" && (
                    <CertificatesTab users={users} certificates={certificates} setCertificates={setCertificates} />
                )}

                {tab === "messages" && <AdminMessagesTab mentors={mentors} />}

                {tab === "courses" && <CoursesTab />}

                {tab === "account" && (
                    <div className="admin-mentor-card" style={{ display: "block" }}>
                        <h4 className="section-subheading">My Account</h4>
                        <p className="tab-hint">Change your admin login password here. If you ever forget it, use "Forgot password?" on the login page — the same OTP-based reset works for admin accounts too.</p>
                        <ChangePassword />
                    </div>
                )}
            </div>

            {profileModal && (
                <ProfileModal profile={profileModal} onClose={() => setProfileModal(null)} />
            )}
        </div>
    );
}

function AdminMessagesTab({ mentors }) {
    const [activeMentorId, setActiveMentorId] = useState(mentors[0]?.id || "");

    const activeMentor = mentors.find((m) => m.id === activeMentorId);

    return (
        <div className="messages-tab" style={{ padding: 0 }}>
            <div className="thread-list">
                {mentors.map((m) => (
                    <div
                        key={m.id}
                        className={m.id === activeMentorId ? "thread-item active" : "thread-item"}
                        onClick={() => setActiveMentorId(m.id)}
                    >
                        <strong>{m.name}</strong>
                        <p>{m.specialization}</p>
                    </div>
                ))}
            </div>
            <div className="thread-chat">
                {activeMentor ? (
                    <ChatWindow
                        key={activeMentor.id}
                        title={activeMentor.name}
                        subtitle={activeMentor.specialization}
                        photo={activeMentor.photo ? `${API_ORIGIN}${activeMentor.photo}` : null}
                        myRole="ADMIN"
                        fetchMessages={() => fetchMessagesWithMentorAsAdmin(activeMentor.id)}
                        sendMessage={(text) => sendMessageToMentorAsAdmin(activeMentor.id, text)}
                    />
                ) : (
                    <EmptyState icon={<Mail size={28} />} message="No mentors to message yet." compact />
                )}
            </div>
        </div>
    );
}

function ResourcePreviewModal({ resource, onClose, onApprove, onReject }) {
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");

    function handleConfirmReject() {
        if (!reason.trim()) {
            toast.error("Enter a reason so the mentor knows what to fix.");
            return;
        }
        onReject(reason.trim());
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" aria-label="Close" onClick={onClose}><X size={18} /></button>

                <h3>{resource.title}</h3>
                <p className="modal-role">
                    By {resource.mentor?.name} ({resource.mentor?.specialization}) — {resource.businessTitle}
                </p>

                <div className="resource-preview-body" style={{ margin: "16px 0" }}>
                    {resource.contentType === "notes" ? (
                        <>
                            {resource.noteText && <p>{resource.noteText}</p>}
                            {resource.url && (
                                <a href={`${API_ORIGIN}${resource.url}`} target="_blank" rel="noreferrer">
                                    Open attached file
                                </a>
                            )}
                        </>
                    ) : (
                        <VideoPlayer url={resource.contentType === "video" ? `${API_ORIGIN}${resource.url}` : resource.url} />
                    )}
                </div>

                {resource.description && (
                    <div className="modal-bio">
                        <strong>Description</strong>
                        <p>{resource.description}</p>
                    </div>
                )}

                {!rejecting ? (
                    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                        <button onClick={onApprove} style={{ background: "#DCFCE7", color: "#15803D" }}>
                            <CheckCircle size={16} /> Looks Good — Approve
                        </button>
                        <button onClick={() => setRejecting(true)} style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                            <XCircle size={16} /> Reject
                        </button>
                        <button onClick={onClose} style={{ background: "#F3F4F6", color: "#4B5563" }}>
                            Close Without Approving
                        </button>
                    </div>
                ) : (
                    <div style={{ marginTop: 20 }}>
                        <textarea
                            className="full"
                            placeholder="Why is this being rejected? The mentor will see this reason so they can fix and reupload."
                            rows="3"
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontFamily: "inherit" }}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                            <button onClick={handleConfirmReject} style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                                <XCircle size={16} /> Confirm Rejection
                            </button>
                            <button onClick={() => { setRejecting(false); setReason(""); }} style={{ background: "#F3F4F6", color: "#4B5563" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileModal({ profile, onClose }) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" aria-label="Close" onClick={onClose}><X size={18} /></button>

                {profile.photo ? (
                    <img className="modal-photo" src={`${API_ORIGIN}${profile.photo}`} alt={profile.fullName || profile.name} />
                ) : (
                    <div className="modal-photo-fallback">{(profile.fullName || profile.name || "?")[0]}</div>
                )}

                <h3>{profile.fullName || profile.name}</h3>
                <p className="modal-role">{profile.role || profile.specialization}</p>

                <div className="modal-details">
                    {profile.email && <div><strong>Email:</strong> {profile.email}</div>}
                    {profile.mobile && <div><strong>Mobile:</strong> {profile.mobile}</div>}
                    {profile.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
                    {profile.location && <div><strong>Location:</strong> {profile.location}</div>}
                    {profile.experience && <div><strong>Experience:</strong> {profile.experience}</div>}
                    {profile.progress?.primarySkill && <div><strong>Primary Skill:</strong> {profile.progress.primarySkill}</div>}
                </div>

                <div className="modal-bio">
                    <strong>Bio</strong>
                    <p>{profile.bio || "No bio added yet."}</p>
                </div>
            </div>
        </div>
    );
}

function TicketCard({ ticket, onRespond, onClose, onTransfer, showTransfer }) {
    const [showRespondForm, setShowRespondForm] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [saving, setSaving] = useState(false);

    async function submitResponse() {
        if (!responseText.trim()) return;
        setSaving(true);
        try {
            const updated = await respondToMessage(ticket.id, responseText);
            onRespond(updated);
            setShowRespondForm(false);
            setResponseText("");
        } finally {
            setSaving(false);
        }
    }

    async function handleTransfer() {
        if (!confirm(`Transfer this complaint to ${ticket.user?.fullName}'s assigned mentor?`)) return;
        setSaving(true);
        try {
            const updated = await transferMessageToMentor(ticket.id);
            onTransfer(updated);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not transfer this complaint.");
        } finally {
            setSaving(false);
        }
    }

    async function handleClose() {
        if (!confirm("Close this ticket? The user will see it as resolved.")) return;
        const updated = await closeTicket(ticket.id);
        onClose(updated);
    }

    return (
        <div className="ticket-admin-card">
            <div className="ticket-admin-header">
                <div>
                    <span className={`role-badge ${ticket.type === "COMPLAINT" ? "ADMIN" : "USER"}`}>{ticket.type}</span>
                    <span className="ticket-status-pill">{ticket.status}</span>
                </div>
                <span className="ticket-admin-user">{ticket.user?.fullName} ({ticket.user?.email})</span>
            </div>

            <h4>{ticket.subject}</h4>
            <p>{ticket.message}</p>

            {showTransfer && <ComplaintTimeline ticket={ticket} />}

            {ticket.transferredToMentor && (
                <p className="ticket-transfer-info">Transferred to mentor: <strong>{ticket.transferredToMentor.name}</strong></p>
            )}

            {ticket.adminResponse && (
                <div className="ticket-response-box">
                    <strong>Response sent:</strong>
                    <p>{ticket.adminResponse}</p>
                </div>
            )}

            {ticket.status !== "CLOSED" && (
                <div className="ticket-actions">
                    <button className="btn-outline-blue" onClick={() => setShowRespondForm((v) => !v)}>Respond</button>
                    {showTransfer && !ticket.transferredToMentor && (
                        <button className="btn-outline-purple" onClick={handleTransfer} disabled={saving}>
                            {saving ? "Transferring..." : "Transfer to Their Mentor"}
                        </button>
                    )}
                    <button className="btn-outline-gray" onClick={handleClose}>Close Ticket</button>
                </div>
            )}

            {showRespondForm && (
                <div className="ticket-inline-form">
                    <textarea
                        placeholder="Type your response to the user..."
                        rows="3"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                    />
                    <button onClick={submitResponse} disabled={saving}>{saving ? "Sending..." : "Send Response"}</button>
                </div>
            )}
        </div>
    );
}

function CertificatesTab({ users, certificates, setCertificates }) {
    const [certQuery, setCertQuery] = useState("");
    const [userId, setUserId] = useState("");
    const [businessTitle, setBusinessTitle] = useState("");
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [pending, setPending] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [userEnrollments, setUserEnrollments] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [pendingResources, setPendingResources] = useState([]);
    const [loadingPendingResources, setLoadingPendingResources] = useState(true);
    const [previewResource, setPreviewResource] = useState(null);
    const [viewedResourceIds, setViewedResourceIds] = useState([]);

    useEffect(() => {
        fetchPendingApprovals().then(setPending).finally(() => setLoadingPending(false));
    }, []);

    useEffect(() => {
        fetchPendingResources().then(setPendingResources).finally(() => setLoadingPendingResources(false));
    }, []);

    function handlePreviewResource(resource) {
        setPreviewResource(resource);
        setViewedResourceIds((prev) => (prev.includes(resource.id) ? prev : [...prev, resource.id]));
    }

    async function handleApproveResource(id) {
        await approveResource(id);
        setPendingResources((prev) => prev.filter((r) => r.id !== id));
        setPreviewResource(null);
        toast.success("Resource approved. Learners can now see it.");
    }

    async function handleRejectResource(id, reason) {
        try {
            await rejectResource(id, reason);
            setPendingResources((prev) => prev.filter((r) => r.id !== id));
            setPreviewResource(null);
            toast.success("Resource rejected. The mentor has been notified with your reason.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not reject resource.");
        }
    }

    useEffect(() => {
        if (!userId) return;
        async function load() {
            setLoadingEnrollments(true);
            const list = await fetchEnrollmentsForUser(userId);
            setUserEnrollments(list);
            setBusinessTitle(list[0]?.businessTitle || "");
            setLoadingEnrollments(false);
        }
        load();
    }, [userId]);

    async function handleApprove(enrollmentId) {
        const updated = await approveCompletion(enrollmentId);
        setPending((prev) => prev.filter((p) => p.id !== enrollmentId));
        setUserId(updated.userId);
        toast.success("Approved! Now issue their certificate below.");
    }

    const selectedEnrollment = userEnrollments.find((e) => e.businessTitle === businessTitle);
    const eligibleForCertificate = Boolean(selectedEnrollment?.examPassed && selectedEnrollment?.interviewPassed && selectedEnrollment?.resultsApproved);

    async function handleIssue(e) {
        e.preventDefault();
        if (!userId || !businessTitle || !file) {
            toast.error("Select a learner, pick their course, and choose a certificate file.");
            return;
        }
        if (!eligibleForCertificate) {
            toast.error("This learner hasn't passed both the exam and interview for this course yet.");
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("userId", userId);
            fd.append("businessTitle", businessTitle);
            fd.append("file", file);
            const created = await issueCertificate(fd);
            setCertificates((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
            setUserId(""); setBusinessTitle(""); setFile(null);
            toast.success("Certificate issued.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not issue certificate.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <h4 className="section-subheading">Pending Training Content</h4>
            <p className="tab-hint">Resources a mentor has shared, waiting for your approval before learners can see them.</p>

            {loadingPendingResources ? (
                <Skeleton variant="table" count={3} label="Loading" />
            ) : pendingResources.length === 0 ? (
                <EmptyState icon={<Film size={28} />} message="No resources waiting for approval." />
            ) : (
                pendingResources.map((r) => {
                    const viewed = viewedResourceIds.includes(r.id);
                    return (
                        <div className="admin-mentor-card" key={r.id}>
                            <div className="info">
                                <h4>{r.title}</h4>
                                <p>By {r.mentor?.name} ({r.mentor?.specialization}) — {r.businessTitle} — {r.contentType}</p>
                            </div>
                            <button onClick={() => handlePreviewResource(r)} style={{ background: "#F3F4F6", color: "#4B5563", marginRight: 8 }}>
                                View Resource
                            </button>
                            <button
                                onClick={() => handleApproveResource(r.id)}
                                disabled={!viewed}
                                title={viewed ? "" : "Please view the resource before approving"}
                                style={{ background: viewed ? "#DCFCE7" : "#E5E7EB", color: viewed ? "#15803D" : "#9CA3AF", cursor: viewed ? "pointer" : "not-allowed", marginRight: 8 }}
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handlePreviewResource(r)}
                                title="Open the resource to reject it with a reason"
                                style={{ background: "#FEE2E2", color: "#B91C1C" }}
                            >
                                Reject
                            </button>
                        </div>
                    );
                })
            )}

            {previewResource && (
                <ResourcePreviewModal
                    resource={previewResource}
                    onClose={() => setPreviewResource(null)}
                    onApprove={() => handleApproveResource(previewResource.id)}
                    onReject={(reason) => handleRejectResource(previewResource.id, reason)}
                />
            )}

            <h4 className="section-subheading">Pending Approval</h4>
            <p className="tab-hint">A mentor has recorded exam + interview results for these learners. Review and approve before their course counts as completed.</p>

            {loadingPending ? (
                <Skeleton variant="table" count={3} label="Loading" />
            ) : pending.length === 0 ? (
                <EmptyState icon={<CheckCircle size={28} />} message="Nothing waiting for approval right now." />
            ) : (
                pending.map((p) => (
                    <div className="admin-mentor-card" key={p.id}>
                        <div className="info">
                            <h4>{p.user?.fullName} — {p.businessTitle}</h4>
                            <p>Exam: {p.examScore}/{p.examTotal} · Interview: {p.interviewScore ?? "-"}/100</p>
                        </div>
                        <button onClick={() => handleApprove(p.id)} style={{ background: "#DCFCE7", color: "#15803D" }}>Approve</button>
                    </div>
                ))
            )}

            <h4 className="section-subheading">Issue a Certificate</h4>
            <form className="mentor-form" onSubmit={handleIssue}>
                <select value={userId} onChange={(e) => { setUserId(e.target.value); if (!e.target.value) { setUserEnrollments([]); setBusinessTitle(""); } }}>
                    <option value="">Select learner</option>
                    {users.filter((u) => u.role === "USER").map((u) => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                    ))}
                </select>

                <select value={businessTitle} onChange={(e) => setBusinessTitle(e.target.value)} disabled={!userId || loadingEnrollments}>
                    <option value="">{loadingEnrollments ? "Loading courses..." : "Select course"}</option>
                    {userEnrollments.map((en) => (
                        <option key={en.id} value={en.businessTitle}>{en.businessTitle}</option>
                    ))}
                </select>

                {selectedEnrollment && (
                    <p className="form-note" style={{ gridColumn: "1 / -1" }}>
                        Exam: {selectedEnrollment.examScore ?? "-"}/{selectedEnrollment.examTotal ?? "-"} ({selectedEnrollment.examPassed ? "Passed" : "Not Passed"}) ·{" "}
                        Interview: {selectedEnrollment.interviewScore ?? "-"}/100 ({selectedEnrollment.interviewPassed ? "Passed" : "Not Passed"})
                    </p>
                )}

                <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit" disabled={saving || !eligibleForCertificate} className="full">
                    {saving ? "Issuing..." : eligibleForCertificate ? "Issue Certificate" : (selectedEnrollment?.examPassed && selectedEnrollment?.interviewPassed) ? "Approve this learner's results first" : "Learner hasn't passed both exam & interview yet"}
                </button>
            </form>

            <h4 className="section-subheading">Issued Certificates</h4>
            {certificates.length === 0 ? (
                <EmptyState icon={<Trophy size={28} />} message="No certificates issued yet." />
            ) : (
                <>
                    <SearchBar value={certQuery} onChange={setCertQuery} placeholder="Search certificates by learner or course..." label="Search certificates" />
                    {(() => {
                        const q = certQuery.trim().toLowerCase();
                        const filteredCerts = q
                            ? certificates.filter((c) => c.user?.fullName?.toLowerCase().includes(q) || c.businessTitle?.toLowerCase().includes(q))
                            : certificates;

                        if (filteredCerts.length === 0) {
                            return <EmptyState icon={<Award size={28} />} message={`No certificates match "${certQuery}".`} actionLabel="Clear search" onAction={() => setCertQuery("")} />;
                        }

                        return filteredCerts.map((c) => (
                            <div className="admin-mentor-card" key={c.id}>
                                <div className="info">
                                    <h4>{c.user?.fullName} — {c.businessTitle}</h4>
                                    <p>Issued {formatDate(c.issuedAt)}</p>
                                </div>
                                <a href={`${API_ORIGIN}${c.fileUrl}`} target="_blank" rel="noreferrer">
                                    <button style={{ background: "#DBEAFE", color: "#1D4ED8" }}>View</button>
                                </a>
                            </div>
                        ));
                    })()}
                </>
            )}
        </>
    );
}

function MentorsTab({ form, setForm, setPhotoFile, editingId, saving, mentors, setMentors, handleSaveMentor, handleEditMentor, handleDeleteMentor, setProfileModal }) {
    const [mentorQuery, setMentorQuery] = useState("");
    const [loginFormFor, setLoginFormFor] = useState(null);
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [otpStage, setOtpStage] = useState("idle");
    const [otpValue, setOtpValue] = useState("");
    const [demoOtp, setDemoOtp] = useState("");
    const [loginSaving, setLoginSaving] = useState(false);

    function openLoginForm(mentor) {
        setLoginFormFor(mentor.id);
        setLoginForm({ email: mentor.email || "", password: "" });
        setOtpStage("idle");
        setOtpValue("");
        setDemoOtp("");
    }

    async function handleSendOtp() {
        if (!loginForm.email) {
            toast.error("Enter the mentor's email first.");
            return;
        }
        try {
            const result = await sendMentorLoginOtp(loginForm.email);
            setDemoOtp(result?.demoOtp || "");
            setOtpStage("sent");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not send OTP.");
        }
    }

    async function handleCreateLogin(mentorId) {
        if (!loginForm.email || (loginForm.password.length < 8 || !/[0-9]/.test(loginForm.password) || !/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(loginForm.password)) || !otpValue) {
            toast.error("Email, a password of 6+ characters, and the OTP are required.");
            return;
        }
        setLoginSaving(true);
        try {
            await createMentorLogin(mentorId, { ...loginForm, otp: otpValue });
            toast.success(`Login verified and saved. Share these with the mentor:\n\nEmail: ${loginForm.email}\nPassword: ${loginForm.password}`);
            setMentors((prev) => prev.map((m) => (m.id === mentorId ? { ...m, userId: "linked" } : m)));
            setLoginFormFor(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not create login.");
        } finally {
            setLoginSaving(false);
        }
    }

    return (
        <>
            <form className="mentor-form" onSubmit={handleSaveMentor}>
                <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
                    <option value="">Specialization</option>
                    {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input placeholder="Experience (e.g. 8 Years)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
                <input className="full" placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                <p className="form-note">Mentor ratings are calculated automatically from learner feedback - they aren't set manually.</p>
                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Mentor" : "Add Mentor"}
                </button>
            </form>

            <SearchBar value={mentorQuery} onChange={setMentorQuery} placeholder="Search mentors by name, specialization, or location..." label="Search mentors" />

            {(() => {
                const q = mentorQuery.trim().toLowerCase();
                const filteredMentors = q
                    ? mentors.filter((m) =>
                        m.name?.toLowerCase().includes(q) ||
                        m.specialization?.toLowerCase().includes(q) ||
                        m.location?.toLowerCase().includes(q)
                    )
                    : mentors;

                if (filteredMentors.length === 0) {
                    return <EmptyState icon={<Users size={28} />} message={`No mentors match "${mentorQuery}".`} actionLabel="Clear search" onAction={() => setMentorQuery("")} />;
                }

                return filteredMentors.map((m) => (
                <div key={m.id}>
                    <div className="admin-mentor-card">
                        {m.photo ? (
                            <img src={`${API_ORIGIN}${m.photo}`} alt={m.name} />
                        ) : (
                            <div className="avatar-fallback">{m.name?.[0]}</div>
                        )}
                        <div className="info">
                            <h4>{m.name}</h4>
                            <p>{m.specialization} — {m.experience} — {m.location}</p>
                            <p className="mentor-rating-line"><Star size={14} className="star-filled" /> {m.rating > 0 ? m.rating.toFixed(1) : "No ratings yet"}</p>
                        </div>
                        <button onClick={() => setProfileModal(m)} style={{ background: "#F3F4F6", color: "#4B5563", marginRight: 8 }}>View</button>
                        <button onClick={() => handleEditMentor(m)} style={{ background: "#DBEAFE", color: "#1D4ED8", marginRight: 8 }}>Edit</button>
                        <button onClick={() => openLoginForm(m)} style={{ background: "#DCFCE7", color: "#15803D", marginRight: 8 }}>
                            {m.userId ? "Reset Login" : "Create Login"}
                        </button>
                        <button onClick={() => handleDeleteMentor(m.id)}>Remove</button>
                    </div>

                    {loginFormFor === m.id && (
                        <div className="login-form-inline">
                            <input
                                placeholder="Mentor's email"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                disabled={otpStage === "sent"}
                            />
                            <input
                                placeholder="Set a password (6+ characters)"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            />
                            {otpStage === "idle" ? (
                                <button onClick={handleSendOtp}>Send OTP to Mentor's Email</button>
                            ) : (
                                <>
                                    <input
                                        placeholder="Enter OTP"
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value)}
                                        maxLength={6}
                                    />
                                    <button onClick={() => handleCreateLogin(m.id)} disabled={loginSaving}>
                                        {loginSaving ? "Saving..." : "Verify & Save"}
                                    </button>
                                </>
                            )}
                            <button onClick={() => setLoginFormFor(null)} style={{ background: "#F3F4F6", color: "#4B5563" }}>
                                Cancel
                            </button>
                            {demoOtp && (
                                <p className="demo-otp-note">
                                    Demo mode: OTP sent to mentor's email is <strong>{demoOtp}</strong> (no real email provider configured yet)
                                </p>
                            )}
                        </div>
                    )}
                </div>
                ));
            })()}
        </>
    );
}

const emptySubCourseForm = {
    title: "", skill: "", description: "", investment: "", income: "",
    difficulty: "", duration: "", requiredSkills: "", roadmapSteps: "",
};

function CoursesTab() {
    const [courses, setCourses] = useState({});
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptySubCourseForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    function load() {
        setLoading(true);
        fetchAllCourses().then(setCourses).finally(() => setLoading(false));
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
        load();
    }, []);

    function startEdit(skill, sub) {
        setEditingId(sub.id);
        setForm({
            title: sub.title, skill,
            description: sub.description || "", investment: sub.investment || "",
            income: sub.income || "", difficulty: sub.difficulty || "", duration: sub.duration || "",
            requiredSkills: (sub.requiredSkills || []).join(", "),
            roadmapSteps: (sub.roadmapSteps || []).join(", "),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        setForm(emptySubCourseForm);
        setEditingId(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.skill.trim() || !form.title.trim()) {
            toast.error("Both the course (category) name and the sub-course title are required.");
            return;
        }
        setSaving(true);
        const payload = {
            title: form.title.trim(),
            skill: form.skill.trim(),
            description: form.description,
            investment: form.investment,
            income: form.income,
            difficulty: form.difficulty,
            duration: form.duration,
            requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
            roadmapSteps: form.roadmapSteps.split(",").map((s) => s.trim()).filter(Boolean),
        };
        try {
            if (editingId) {
                await updateSubCourse(editingId, payload);
                toast.success("Sub-course updated.");
            } else {
                await createSubCourse(payload);
                toast.success("Sub-course added.");
            }
            resetForm();
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save this sub-course.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Remove this sub-course? This can't be undone.")) return;
        await deleteSubCourse(id);
        load();
    }

    const skillNames = Object.keys(courses).sort();

    return (
        <>
            <h4 className="section-subheading">Add a Course / Sub-Course</h4>
            <p className="tab-hint">
                A "course" is a top-level category (e.g. Cooking, Tailoring). A "sub-course" is a specific business idea
                learners can pick under that course (e.g. Home Bakery Business). This is a forward-looking feature -
                learners don't browse these live yet, but the catalogue is ready for when that page is wired up.
            </p>
            <form className="mentor-form" onSubmit={handleSubmit}>
                <input
                    list="existing-skills"
                    placeholder="Course / category name (e.g. Cooking)"
                    value={form.skill}
                    onChange={(e) => setForm({ ...form, skill: e.target.value })}
                />
                <datalist id="existing-skills">
                    {skillNames.map((s) => <option key={s} value={s} />)}
                </datalist>
                <input placeholder="Sub-course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <input placeholder="Investment (e.g. ₹10,000 - ₹50,000)" value={form.investment} onChange={(e) => setForm({ ...form, investment: e.target.value })} />
                <input placeholder="Expected income (e.g. ₹15,000/month)" value={form.income} onChange={(e) => setForm({ ...form, income: e.target.value })} />
                <input placeholder="Difficulty (e.g. Beginner)" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
                <input placeholder="Duration (e.g. 3 months)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                <input className="full" placeholder="Required skills (comma separated)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
                <input className="full" placeholder="Roadmap steps (comma separated)" value={form.roadmapSteps} onChange={(e) => setForm({ ...form, roadmapSteps: e.target.value })} />
                <textarea className="full" rows="2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Sub-Course" : "Add Sub-Course"}
                </button>
                {editingId && (
                    <button type="button" onClick={resetForm} style={{ background: "#F3F4F6", color: "#4B5563" }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <h4 className="section-subheading">Existing Courses</h4>
            {loading ? (
                <Skeleton variant="table" count={3} label="Loading" />
            ) : skillNames.length === 0 ? (
                <EmptyState message="No courses added yet. Use the form above to create the first one." />
            ) : (
                skillNames.map((skill) => (
                    <div key={skill} style={{ marginBottom: 20 }}>
                        <h4 style={{ marginBottom: 8 }}>{skill}</h4>
                        {courses[skill].map((sub) => (
                            <div className="admin-mentor-card" key={sub.id}>
                                <div className="info">
                                    <h4>{sub.title}</h4>
                                    <p>{sub.difficulty} — {sub.duration} — {sub.investment}</p>
                                </div>
                                <button onClick={() => startEdit(skill, sub)} style={{ background: "#DBEAFE", color: "#1D4ED8", marginRight: 8 }}>Edit</button>
                                <button onClick={() => handleDelete(sub.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </>
    );
}

export default AdminDashboard;
