import "./ListingPages.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { fetchMentors, fetchMyAssignedMentor } from "../services/mentorService";
import { fetchMyEnrollments } from "../services/examService";
import { API_ORIGIN } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/Search/Search";
import Skeleton from "../components/Skeleton/Skeleton";
import EmptyState from "../components/EmptyState/EmptyState";
import { Users } from "lucide-react";

function MentorCard({ mentor, loggedIn }) {
    const navigate = useNavigate();

    return (
        <div className="listing-card">
            {mentor.photo ? (
                <img
                    src={`${API_ORIGIN}${mentor.photo}`}
                    alt={mentor.name}
                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 10 }}
                />
            ) : (
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#2563EB", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 10 }}>
                    {mentor.name?.[0]}
                </div>
            )}
            <span className="listing-tag">{mentor.specialization}</span>
            <h3>{mentor.name}</h3>
            <p>{mentor.experience} of experience • {mentor.location}</p>
            {mentor.bio && <p style={{ fontSize: 13, color: "#6B7280" }}>{mentor.bio}</p>}
            <div className="listing-meta">
                <span>⭐ {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</span>
            </div>

            {loggedIn ? (
                <button onClick={() => navigate(`/chat/${mentor.id}`)}>Contact Mentor</button>
            ) : (
                <button onClick={() => navigate("/login")} style={{ background: "#F3F4F6", color: "#4B5563" }}>
                    Login to Contact
                </button>
            )}
        </div>
    );
}

function Mentors() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [myMentor, setMyMentor] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);

    const loggedIn = Boolean(user) && user.role === "USER";
    const selectedBusiness = localStorage.getItem("selectedBusiness");
    const roadmapProgress = Number(localStorage.getItem("roadmapProgress") || 0);

    useEffect(() => {
        if (loggedIn) {
            Promise.all([fetchMentors(), fetchMyAssignedMentor(), fetchMyEnrollments()])
                .then(([all, mine, enrollments]) => {
                    setMentors(all);
                    setMyMentor(mine);
                    setEnrollment(enrollments.find((e) => e.businessTitle === selectedBusiness) || null);
                })
                .finally(() => setLoading(false));
        } else {
            fetchMentors().then(setMentors).finally(() => setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn]);

    if (loading || authLoading) {
        return (
            <MainLayout>
                <section className="listing-page">
                    <h1>Mentors</h1>
                    <Skeleton variant="cards" count={6} label="Loading mentors" />
                </section>
            </MainLayout>
        );
    }

    if (loggedIn) {
        if (!selectedBusiness) {
            return (
                <MainLayout>
                    <section className="listing-page">
                        <h1>Your Mentor</h1>
                        <div className="login-required-note">
                            <p>Pick a course first - your mentor unlocks once you're underway.</p>
                            <button onClick={() => navigate("/business-ideas")}>Browse Business Ideas</button>
                        </div>
                    </section>
                </MainLayout>
            );
        }

        if (enrollment?.status === "COMPLETED") {
            return (
                <MainLayout>
                    <section className="listing-page">
                        <h1>Your Mentor</h1>
                        <div className="login-required-note">
                            <p>You completed this course! Click here for your certificate and report card.</p>
                            <button onClick={() => navigate("/business-ideas")}>View Certificate & Report Card</button>
                        </div>
                    </section>
                </MainLayout>
            );
        }

        if (roadmapProgress < 100) {
            return (
                <MainLayout>
                    <section className="listing-page">
                        <h1>Your Mentor</h1>
                        <div className="login-required-note">
                            <p>🔒 Finish your roadmap (currently {roadmapProgress}%) to unlock your mentor's contact.</p>
                            <button onClick={() => navigate("/business-roadmap")}>Go to Roadmap</button>
                        </div>
                    </section>
                </MainLayout>
            );
        }

        return (
            <MainLayout>
                <section className="listing-page">
                    <h1>Your Mentor</h1>
                    <p>You've been matched with a mentor based on your skill.</p>

                    <div className="listing-grid">
                        {myMentor ? (
                            <MentorCard mentor={myMentor} loggedIn={loggedIn} />
                        ) : (
                            <p>A mentor will be assigned once you complete your skill assessment.</p>
                        )}
                    </div>
                </section>
            </MainLayout>
        );
    }

    // Guests just browse the directory grouped by specialization, to get a
    // feel for the mentors on the platform - contact stays locked behind login.
    return <MentorDirectory mentors={mentors} loggedIn={loggedIn} />;
}

function MentorDirectory({ mentors, loggedIn }) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return mentors;
        return mentors.filter((m) =>
            m.name?.toLowerCase().includes(q) ||
            m.specialization?.toLowerCase().includes(q) ||
            m.location?.toLowerCase().includes(q)
        );
    }, [mentors, query]);

    const bySpecialization = filtered.reduce((groups, mentor) => {
        groups[mentor.specialization] = groups[mentor.specialization] || [];
        groups[mentor.specialization].push(mentor);
        return groups;
    }, {});

    return (
        <MainLayout>
            <section className="listing-page">
                <h1>Meet Our Mentors</h1>
                <p>Connect with experienced professionals ready to guide your business journey.</p>

                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Search mentors by name, specialization, or location..."
                    label="Search mentors"
                />

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={<Users size={28} />}
                        message={`No mentors match "${query}".`}
                        actionLabel="Clear search"
                        onAction={() => setQuery("")}
                    />
                ) : (
                    Object.entries(bySpecialization).map(([specialization, group]) => (
                        <div key={specialization} className="mentor-specialization-group">
                            <h2>{specialization}</h2>
                            <div className="listing-grid">
                                {group.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} loggedIn={loggedIn} />)}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </MainLayout>
    );
}

export default Mentors;
