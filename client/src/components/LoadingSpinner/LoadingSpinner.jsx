import "./LoadingSpinner.css";

function LoadingSpinner({ label = "Loading..." }) {
    return (
        <div className="loading-spinner-wrap">
            <div className="loading-spinner" />
            <span>{label}</span>
        </div>
    );
}

export default LoadingSpinner;
