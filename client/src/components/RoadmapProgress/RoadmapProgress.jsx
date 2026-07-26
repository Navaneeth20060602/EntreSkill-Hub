import "./RoadmapProgress.css";
import { useEffect, useState } from "react";
import roadmaps from "../../data/roadmaps";
import { saveCompletedStepsRequest } from "../../services/profileService";

function RoadmapProgress() {

    const selectedBusiness = localStorage.getItem("selectedBusiness");

    const steps = roadmaps[selectedBusiness] || [];

    const storageKey = `progress-${selectedBusiness}`;

    const [completedSteps, setCompletedSteps] = useState(() => {

        const saved = localStorage.getItem(storageKey);

        return saved ? JSON.parse(saved) : [];

    });

    useEffect(() => {

        localStorage.setItem(
            storageKey,
            JSON.stringify(completedSteps)
        );

        // Keep the backend in sync too, so this is correct per-account
        // instead of only living in this browser's storage.
        saveCompletedStepsRequest(completedSteps).catch(() => {});

    }, [completedSteps, storageKey]);

    function toggleStep(step) {

        // Once a step is ticked, it's locked in - stops learners from
        // gaming the roadmap progress by checking and unchecking steps.
        if (completedSteps.includes(step)) {
            return;
        }

        setCompletedSteps([
            ...completedSteps,
            step
        ]);

    }

    // Defensive: only count completed steps that still exist in the
    // current roadmap, and de-duplicate. Without this, stale entries left
    // over from an older/different roadmap (or a duplicate step label)
    // could push the count above the actual number of steps, showing
    // progress over 100%.
    const validCompletedSteps = [...new Set(completedSteps)].filter((step) =>
        steps.includes(step)
    );

    const progress =
        steps.length === 0
            ? 0
            : Math.min(
                100,
                Math.round((validCompletedSteps.length / steps.length) * 100)
            );

    useEffect(() => {
        localStorage.setItem("roadmapProgress", String(progress));
    }, [progress]);

    return (

        <section className="progress-section">

            <h2>Your Progress</h2>

            <p>{progress}% Completed</p>

            <div className="progress-bar">

                <div

                    className="progress-fill"

                    style={{

                        width: `${progress}%`

                    }}

                ></div>

            </div>

            <div className="progress-steps">

                {

                    steps.map((step) => (

                        <label

                            key={step}

                            className={completedSteps.includes(step) ? "progress-item locked" : "progress-item"}

                        >

                            <input

                                type="checkbox"

                                checked={completedSteps.includes(step)}

                                disabled={completedSteps.includes(step)}

                                onChange={() => toggleStep(step)}

                            />

                            {step}
                            {completedSteps.includes(step) && <span className="locked-tag">🔒 Locked</span>}

                        </label>

                    ))

                }

            </div>

        </section>

    );

}

export default RoadmapProgress;