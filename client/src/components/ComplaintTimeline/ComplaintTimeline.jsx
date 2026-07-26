import "./ComplaintTimeline.css";
import { formatDate } from "../../utils/formatDate";

// Infers a chronological sequence of events from the fields that already
// exist on ContactMessage (no new audit-trail model needed): Opened ->
// [Transferred] -> Responded/Closed. Good enough to visualize progress
// without a dedicated event log.
function ComplaintTimeline({ ticket }) {
    const steps = [
        { key: "opened", label: "Opened", date: ticket.createdAt, done: true },
    ];

    if (ticket.transferredToMentorId) {
        steps.push({
            key: "transferred",
            label: ticket.transferredToMentor?.name
                ? `Transferred to ${ticket.transferredToMentor.name}`
                : "Transferred to mentor",
            date: null,
            done: true,
        });
    }

    const isResolved = ["RESPONDED", "RESOLVED", "CLOSED"].includes(ticket.status);

    steps.push({
        key: "responded",
        label: ticket.status === "CLOSED" ? "Closed" : "Responded",
        date: ticket.respondedAt,
        done: isResolved,
    });

    return (
        <div className="complaint-timeline">
            {steps.map((step, idx) => (
                <div className="complaint-timeline-step" key={step.key}>
                    <div className="complaint-timeline-marker">
                        <span className={`complaint-timeline-dot ${step.done ? "done" : "pending"}`} />
                        {idx < steps.length - 1 && <span className="complaint-timeline-line" />}
                    </div>
                    <div className="complaint-timeline-content">
                        <span className="complaint-timeline-label">{step.label}</span>
                        {step.date && (
                            <span className="complaint-timeline-date">{formatDate(step.date)}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ComplaintTimeline;
