import { Component } from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Unhandled UI error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-page">
                    <h1>Something went wrong</h1>
                    <p>We hit an unexpected error. Try reloading the page - if it keeps happening, let us know through the Contact page.</p>
                    <button onClick={() => window.location.assign("/")}>Back to Home</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
