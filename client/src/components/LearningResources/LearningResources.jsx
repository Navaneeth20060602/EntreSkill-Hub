import "./LearningResources.css";
import learningResources from "../../data/learningResources";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchResources, rateResource } from "../../services/mentorService";
import { saveResourcesCompletedRequest } from "../../services/profileService";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import CourseStepper from "../CourseStepper/CourseStepper";
import { API_ORIGIN } from "../../services/api";
import { fetchMyEnrollments } from "../../services/examService";
import { toast } from "../../context/ToastContext";
import EmptyState from "../EmptyState/EmptyState";
import { BookOpen } from "lucide-react";

const WATCH_THRESHOLD = 0.75; // must watch at least 75% before marking as done

function StarRating({ resourceId, initialAverage, initialCount }) {
    const [myRating, setMyRating] = useState(0);
    const [average, setAverage] = useState(initialAverage);
    const [count, setCount] = useState(initialCount);

    async function handleRate(value) {
        const previousRating = myRating;
        setMyRating(value);
        try {
            const result = await rateResource(resourceId, value);
            setAverage(result.averageRating);
            setCount(result.ratingCount);
        } catch {
            setMyRating(previousRating);
        }
    }

    return (
        <div className="resource-rating">
            <span className="resource-rating-avg">
                {average > 0 ? `⭐ ${average} (${count})` : "No ratings yet"}
            </span>
            <div className="resource-rating-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                    <span
                        key={n}
                        className={n <= myRating ? "rate-star filled" : "rate-star"}
                        onClick={() => handleRate(n)}
                    >
                        ★
                    </span>
                ))}
            </div>
        </div>
    );
}

function LearningResources() {

    const navigate = useNavigate();

    const selectedBusiness = localStorage.getItem("selectedBusiness");

    const resource = learningResources[selectedBusiness];

    const [mentorResources, setMentorResources] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [watchedIds, setWatchedIds] = useState(() => {
        const saved = localStorage.getItem(`watchedResources:${selectedBusiness}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [watchProgress, setWatchProgress] = useState({});
    const [enrollment, setEnrollment] = useState(null);

    useEffect(() => {
        if (selectedBusiness) {
            fetchResources(selectedBusiness).then(setMentorResources).catch(() => setMentorResources([]));
            fetchMyEnrollments().then((list) => setEnrollment(list.find((e) => e.businessTitle === selectedBusiness) || null));
        }
    }, [selectedBusiness]);

    function toggleWatched(id) {
        const resourceItem = mentorResources.find((r) => r.id === id);
        const canMark = resourceItem?.contentType !== "video" || (watchProgress[id] || 0) >= WATCH_THRESHOLD;

        if (!watchedIds.includes(id) && !canMark) {
            toast.error("Please watch at least 75% of this video before marking it as watched.");
            return;
        }

        setWatchedIds((prev) => {
            const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            localStorage.setItem(`watchedResources:${selectedBusiness}`, JSON.stringify(updated));

            // Once everything is watched, quietly record that in the
            // background - the roadmap isn't gated by this, it's just used
            // for the "recommended next step" hint on the stepper.
            if (mentorResources.length > 0 && mentorResources.every((r) => updated.includes(r.id))) {
                localStorage.setItem(`resourcesCompleted:${selectedBusiness}`, "true");
                saveResourcesCompletedRequest(true).catch(() => {});
            }
            return updated;
        });
    }

    function handleTimeUpdate(e) {
        if (!activeVideo) return;
        const video = e.target;
        if (!video.duration) return;
        const percent = video.currentTime / video.duration;
        setWatchProgress((prev) => ({ ...prev, [activeVideo.id]: Math.max(prev[activeVideo.id] || 0, percent) }));
    }

    const allWatched = mentorResources.length > 0 && mentorResources.every((r) => watchedIds.includes(r.id));

    if (!resource) {

        return (

            <section className="learning-resources">

                <EmptyState
                    icon={<BookOpen size={28} />}
                    message="📚 No learning resources available yet. We're still preparing material for this business — check back soon."
                />

            </section>

        );

    }

    return (

        <section className="learning-resources">

            <CourseStepper current="resources" enrollment={enrollment} />

            <h1>Resources</h1>

            <p>
                Learn everything required to successfully start your business.
            </p>

            <div className="business-name">
                <strong>Selected Business:</strong> {selectedBusiness}
            </div>

            <div className="learning-grid">

                <div className="learning-card">
                    <h2>Required Skills</h2>
                    <ul>
                        {resource.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </div>

            </div>

            <div className="youtube-section">
                <h2>Mentor Resources</h2>
                <p className="mentor-resources-hint">All learning material for this course comes directly from your mentor.</p>

                {mentorResources.length === 0 ? (
                    <EmptyState
                        icon={<BookOpen size={28} />}
                        message="📚 No learning resources available yet. Your mentor hasn't shared any material for this course — check back soon."
                        compact
                    />
                ) : (
                    <>
                        {activeVideo && activeVideo.contentType !== "notes" && (
                            <div style={{ marginBottom: 24 }}>
                                <VideoPlayer
                                    url={activeVideo.contentType === "video" ? `${API_ORIGIN}${activeVideo.url}` : activeVideo.url}
                                    title={activeVideo.title}
                                    onTimeUpdate={activeVideo.contentType === "video" ? handleTimeUpdate : undefined}
                                />
                            </div>
                        )}

                        {activeVideo && activeVideo.contentType === "notes" && (
                            <div className="notes-viewer">
                                {activeVideo.noteText && <p>{activeVideo.noteText}</p>}
                                {activeVideo.url && (
                                    <a href={`${API_ORIGIN}${activeVideo.url}`} target="_blank" rel="noreferrer">
                                        Download Notes
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="youtube-grid">
                            {mentorResources.map((r) => {
                                const progress = Math.round((watchProgress[r.id] || 0) * 100);
                                const canMark = r.contentType !== "video" || progress >= 75 || watchedIds.includes(r.id);

                                return (
                                    <div key={r.id} className="youtube-card mentor-resource-card">
                                        <h3>{r.title}</h3>
                                        <p>By {r.mentor?.name || "Mentor"} · <span className="content-type-chip">{r.contentType}</span></p>
                                        <button className="watch-btn" onClick={() => setActiveVideo(r)}>
                                            {r.contentType === "notes" ? "Read Notes" : "Watch Now"}
                                        </button>

                                        {r.contentType !== "notes" && !watchedIds.includes(r.id) && (
                                            <p className="watch-progress-note">{progress}% watched {progress < 75 ? "(need 75%)" : "✓"}</p>
                                        )}

                                        <label className={canMark ? "watched-checkbox" : "watched-checkbox disabled"}>
                                            <input
                                                type="checkbox"
                                                checked={watchedIds.includes(r.id)}
                                                disabled={!canMark && !watchedIds.includes(r.id)}
                                                onChange={() => toggleWatched(r.id)}
                                            />
                                            Mark as watched
                                        </label>

                                        <StarRating resourceId={r.id} initialAverage={r.averageRating || 0} initialCount={r.ratingCount || 0} />
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <button
                className="roadmap-btn"
                onClick={() => navigate("/business-roadmap")}
            >
                Continue to Roadmap
            </button>

            {mentorResources.length > 0 && !allWatched && (
                <p className="resources-gate-note">
                    Tip: watching all mentor resources first will make the roadmap easier to follow.
                </p>
            )}

        </section>

    );

}

export default LearningResources;
