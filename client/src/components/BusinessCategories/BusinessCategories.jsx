import "./BusinessCategories.css";

function BusinessCategories() {
    return (
        <section className="business-categories">

            <h2>Explore Business Categories</h2>

            <p>
                Discover business opportunities based on your skills and interests.
            </p>

            <div className="category-grid">

                <div className="category-card">
                    <h3>🍛 Food & Catering</h3>
                    <p>Home kitchens, catering, bakeries and food services.</p>
                </div>

                <div className="category-card">
                    <h3>👗 Tailoring & Fashion</h3>
                    <p>Tailoring, boutique services and clothing businesses.</p>
                </div>

                <div className="category-card">
                    <h3>🛠 Repair Services</h3>
                    <p>Electrical, plumbing, mobile and appliance repair.</p>
                </div>

                <div className="category-card">
                    <h3>💻 Digital Services</h3>
                    <p>Graphic design, web development, digital marketing and more.</p>
                </div>

                <div className="category-card">
                    <h3>🎨 Arts & Handicrafts</h3>
                    <p>Handmade products, crafts, paintings and creative businesses.</p>
                </div>

                <div className="category-card">
                    <h3>🌱 Agriculture</h3>
                    <p>Organic farming, nursery plants and agri-based businesses.</p>
                </div>

            </div>

        </section>
    );
}

export default BusinessCategories;