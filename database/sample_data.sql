-- A small sample dataset matching server/prisma/seed.js, for anyone who
-- wants to inspect the shape of the data without running Node.
-- Prefer `npm run seed` (in server/) for the full, up-to-date catalog.

INSERT INTO business_ideas (id, title, skill, description, investment, income, difficulty, duration, "requiredSkills", "roadmapSteps")
VALUES (
    'sample-home-catering',
    'Home Catering',
    'Cooking',
    'Prepare homemade meals for families and offices.',
    '₹30,000 - ₹1,00,000',
    '₹25,000 - ₹80,000 / month',
    'Easy',
    '2 - 4 Weeks',
    ARRAY['Communication', 'Customer Handling', 'Business Planning', 'Marketing'],
    ARRAY['Learn food safety', 'Plan your menu', 'Calculate investment', 'Buy kitchen equipment', 'Register your business']
);

INSERT INTO mentors (id, name, specialization, experience, rating, location, email)
VALUES (
    'sample-mentor-1',
    'Rahul Sharma',
    'Cooking',
    '12 Years',
    4.9,
    'Hyderabad',
    'rahul@example.com'
);
