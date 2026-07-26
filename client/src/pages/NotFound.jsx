import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function NotFound() {
    return (
        <MainLayout>
            <section style={{ textAlign: "center", padding: "80px 20px" }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <Link to="/">Go back home</Link>
            </section>
        </MainLayout>
    );
}

export default NotFound;
