import { createContext, useContext, useEffect, useState } from "react";
import { registerRequest, loginRequest, logoutRequest, fetchMe, googleLoginRequest } from "../services/authService";
import { fetchProfile } from "../services/profileService";
import roadmaps from "../data/roadmaps";

// Same rounding/dedup logic RoadmapProgress uses to turn a list of
// completed step labels into a 0-100 percentage, kept in sync here so the
// dashboard/mentors/exam pages show the right number even before the
// learner ever opens the Roadmap page in this session.
function computeRoadmapProgress(businessTitle, completedSteps) {
    const steps = roadmaps[businessTitle] || [];
    if (steps.length === 0) return 0;
    const validCompleted = [...new Set(completedSteps || [])].filter((step) => steps.includes(step));
    return Math.min(100, Math.round((validCompleted.length / steps.length) * 100));
}

const AuthContext = createContext(null);

// All of a learner's course progress (skill lock, chosen course, roadmap
// steps) needs to be correct per-account, not just whatever happens to be
// sitting in this browser's localStorage - otherwise logging out and a
// different person logging in on the same computer would incorrectly
// inherit (or lose) each other's progress. So on every successful
// login/register/session-restore, we pull the real progress from the
// backend and overwrite localStorage with the source of truth, and on
// logout we wipe it clean.
async function syncProgressFromServer() {
    try {
        const progress = await fetchProfile();

        if (progress?.primarySkill) {
            localStorage.setItem("primarySkill", progress.primarySkill);
            localStorage.setItem("selectedSkills", JSON.stringify(progress.selectedSkills || []));
        } else {
            localStorage.removeItem("primarySkill");
            localStorage.removeItem("selectedSkills");
        }

        if (progress?.selectedBusinessTitle) {
            localStorage.setItem("selectedBusiness", progress.selectedBusinessTitle);
            localStorage.setItem(
                `progress-${progress.selectedBusinessTitle}`,
                JSON.stringify(progress.completedSteps || [])
            );
            localStorage.setItem(
                `resourcesCompleted:${progress.selectedBusinessTitle}`,
                progress.resourcesCompleted ? "true" : "false"
            );
            // This is the bit that was missing: the roadmap % chip that the
            // Dashboard/Mentors/Exam pages read from localStorage was only
            // ever (re)computed by the RoadmapProgress component itself, so
            // it silently sat at 0 after every refresh/login until the
            // learner happened to open the Roadmap page again. Recompute it
            // here too, from the same server-backed completedSteps list.
            localStorage.setItem(
                "roadmapProgress",
                String(computeRoadmapProgress(progress.selectedBusinessTitle, progress.completedSteps))
            );
        } else {
            localStorage.removeItem("selectedBusiness");
            localStorage.removeItem("roadmapProgress");
        }
    } catch {
        // Not fatal - falls back to whatever is already in localStorage.
    }
}

function clearProgressFromLocalStorage() {
    localStorage.removeItem("primarySkill");
    localStorage.removeItem("selectedSkills");
    localStorage.removeItem("preselectedSkills");
    localStorage.removeItem("selectedBusiness");
    localStorage.removeItem("roadmapProgress");

    // Roadmap/resource-watch keys are suffixed per business title, so sweep
    // for any of them left over from this session.
    Object.keys(localStorage)
        .filter((key) => key.startsWith("progress-") || key.startsWith("resourcesCompleted:") || key.startsWith("watchedResources:"))
        .forEach((key) => localStorage.removeItem(key));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(async (fetchedUser) => {
        setUser(fetchedUser);
        if (fetchedUser?.role === "USER") await syncProgressFromServer();
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function register(formData) {
    clearProgressFromLocalStorage(); // in case a previous session left anything behind
    const loggedInUser = await registerRequest(formData);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function login(formData) {
    clearProgressFromLocalStorage();
    const loggedInUser = await loginRequest(formData);
    setUser(loggedInUser);
    if (loggedInUser?.role === "USER") await syncProgressFromServer();
    return loggedInUser;
  }

  async function loginWithGoogle(idToken) {
    clearProgressFromLocalStorage();
    const loggedInUser = await googleLoginRequest(idToken);
    setUser(loggedInUser);
    if (loggedInUser?.role === "USER") await syncProgressFromServer();
    return loggedInUser;
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
    clearProgressFromLocalStorage();
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
