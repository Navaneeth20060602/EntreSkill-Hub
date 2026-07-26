import "./Skeleton.css";

// Generic building-block skeleton bar/box. Compose these into page-specific
// skeleton layouts instead of showing a blank screen while data loads.
export function SkeletonBlock({ width = "100%", height = "16px", radius = "6px", className = "" }) {
    return (
        <span
            className={`skeleton-block ${className}`}
            style={{ width, height, borderRadius: radius }}
            aria-hidden="true"
        />
    );
}

// A handful of ready-made layouts covering the shapes used across the app
// (route-level fallback, card grids, tables, dashboards). Pass `label` to
// keep the loading state announced to screen readers.
function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <SkeletonBlock height="120px" radius="10px" />
            <SkeletonBlock width="70%" height="18px" />
            <SkeletonBlock width="95%" height="12px" />
            <SkeletonBlock width="85%" height="12px" />
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="skeleton-row">
            <SkeletonBlock width="40px" height="40px" radius="50%" />
            <div className="skeleton-row-lines">
                <SkeletonBlock width="60%" height="14px" />
                <SkeletonBlock width="35%" height="12px" />
            </div>
        </div>
    );
}

function Skeleton({ variant = "page", count = 3, label = "Loading content" }) {
    return (
        <div className="skeleton-wrap" role="status" aria-live="polite" aria-label={label}>
            {variant === "cards" && (
                <div className="skeleton-card-grid">
                    {Array.from({ length: count }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {variant === "table" && (
                <div className="skeleton-table">
                    {Array.from({ length: count }).map((_, i) => (
                        <SkeletonRow key={i} />
                    ))}
                </div>
            )}

            {variant === "dashboard" && (
                <div className="skeleton-dashboard">
                    <SkeletonBlock width="45%" height="26px" />
                    <SkeletonBlock width="65%" height="14px" />
                    <div className="skeleton-card-grid">
                        {Array.from({ length: count }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            )}

            {variant === "page" && (
                <div className="skeleton-page">
                    <SkeletonBlock width="35%" height="28px" />
                    <SkeletonBlock width="90%" height="14px" />
                    <SkeletonBlock width="80%" height="14px" />
                    <SkeletonBlock width="60%" height="14px" />
                </div>
            )}

            <span className="skeleton-sr-only">{label}…</span>
        </div>
    );
}

export default Skeleton;
