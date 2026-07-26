const businesses = [

    {
        id: 1,

        skill: "Cooking",

        title: "Home Catering",

        description: "Prepare homemade meals for families and offices.",

        investment: "₹30,000 - ₹1,00,000",

        income: "₹25,000 - ₹80,000 / month",

        difficulty: "Easy",

        duration: "2 - 4 Weeks",

        roadmap: [
            "Learn food safety",
            "Plan your menu",
            "Calculate investment",
            "Buy kitchen equipment",
            "Register your business",
            "Create social media pages",
            "Partner with Swiggy/Zomato",
            "Serve first customers"
        ]
    },

    {
        id: 2,

        skill: "Cooking",

        title: "Cloud Kitchen",

        description: "Run a delivery-only restaurant from your kitchen.",

        investment: "₹1,50,000 - ₹5,00,000",

        income: "₹50,000 - ₹2,00,000 / month",

        difficulty: "Medium",

        duration: "1 - 2 Months",

        roadmap: [
            "Research food demand",
            "Choose cuisine",
            "Purchase equipment",
            "Get FSSAI License",
            "Register on Swiggy/Zomato",
            "Create branding",
            "Launch marketing",
            "Start delivery"
        ]
    },

    {
        id: 3,

        skill: "Cooking",

        title: "Bakery",

        description: "Sell cakes, cookies and baked snacks.",

        investment: "₹2,00,000 - ₹8,00,000",

        income: "₹40,000 - ₹2,50,000 / month",

        difficulty: "Medium",

        duration: "2 - 3 Months",

        roadmap: [
            "Learn baking",
            "Purchase oven",
            "Create menu",
            "Get food license",
            "Market online",
            "Start selling",
            "Collect reviews",
            "Expand business"
        ]
    },

    {
        id: 4,

        skill: "Photography",

        title: "Photography Studio",

        description: "Offer portrait and commercial photography.",

        investment: "₹1,00,000 - ₹5,00,000",

        income: "₹40,000 - ₹2,00,000 / month",

        difficulty: "Medium",

        duration: "1 - 2 Months",

        roadmap: [
            "Master camera skills",
            "Build portfolio",
            "Buy equipment",
            "Register business",
            "Create website",
            "Market services",
            "Book first clients",
            "Expand portfolio"
        ]
    },

    {
        id: 5,

        skill: "Photography",

        title: "Wedding Photography",

        description: "Capture weddings and special occasions.",

        investment: "₹2,00,000 - ₹6,00,000",

        income: "₹80,000 - ₹3,00,000 / month",

        difficulty: "Medium",

        duration: "2 Months",

        roadmap: [
            "Practice wedding shoots",
            "Buy professional gear",
            "Build portfolio",
            "Partner with event planners",
            "Advertise services",
            "Book weddings",
            "Collect testimonials",
            "Grow team"
        ]
    },

    {
        id: 6,

        skill: "Teaching",

        title: "Coaching Center",

        description: "Teach students through offline or online classes.",

        investment: "₹20,000 - ₹2,00,000",

        income: "₹30,000 - ₹1,50,000 / month",

        difficulty: "Easy",

        duration: "2 Weeks",

        roadmap: [
            "Choose subject",
            "Prepare syllabus",
            "Create study material",
            "Advertise locally",
            "Enroll students",
            "Conduct classes",
            "Collect feedback",
            "Expand batches"
        ]
    },

    {
        id: 7,
        skill: "Tailoring",
        title: "Custom Boutique Stitching",
        description: "Stitch custom blouses, dresses and alterations for local customers.",
        investment: "₹20,000 - ₹80,000",
        income: "₹15,000 - ₹50,000 / month",
        difficulty: "Easy",
        duration: "2 - 4 Weeks",
        roadmap: [
            "Learn advanced stitching",
            "Buy sewing machine & tools",
            "Set up home workspace",
            "Create sample designs",
            "Advertise in local groups",
            "Take first orders",
            "Build repeat customers",
            "Hire a helper as you grow"
        ]
    },

    {
        id: 8,
        skill: "Tailoring",
        title: "Uniform Manufacturing Unit",
        description: "Supply school and corporate uniforms in bulk to institutions.",
        investment: "₹1,00,000 - ₹4,00,000",
        income: "₹40,000 - ₹1,50,000 / month",
        difficulty: "Medium",
        duration: "1 - 2 Months",
        roadmap: [
            "Study local uniform demand",
            "Buy bulk-stitching machines",
            "Source fabric suppliers",
            "Get sample orders approved",
            "Register your business",
            "Pitch to schools/offices",
            "Set up delivery system",
            "Scale production"
        ]
    },

    {
        id: 9,
        skill: "Graphic Design",
        title: "Freelance Design Studio",
        description: "Design logos, posters and social media creatives for small businesses.",
        investment: "₹10,000 - ₹50,000",
        income: "₹20,000 - ₹80,000 / month",
        difficulty: "Easy",
        duration: "1 - 2 Weeks",
        roadmap: [
            "Master design software",
            "Build a portfolio",
            "Create profiles on freelance platforms",
            "Set your pricing",
            "Pitch to local businesses",
            "Deliver first projects",
            "Collect testimonials",
            "Raise your rates"
        ]
    },

    {
        id: 10,
        skill: "Graphic Design",
        title: "Branding & Print Agency",
        description: "Offer full branding kits - logos, packaging, brochures - to growing businesses.",
        investment: "₹50,000 - ₹2,00,000",
        income: "₹35,000 - ₹1,20,000 / month",
        difficulty: "Medium",
        duration: "1 Month",
        roadmap: [
            "Learn branding fundamentals",
            "Invest in design tools",
            "Partner with a print vendor",
            "Build a small team",
            "Create case studies",
            "Network with local businesses",
            "Sign retainer clients",
            "Expand service offerings"
        ]
    },

    {
        id: 11,
        skill: "Carpentry",
        title: "Custom Furniture Workshop",
        description: "Build and sell custom wooden furniture for homes and offices.",
        investment: "₹80,000 - ₹3,00,000",
        income: "₹30,000 - ₹1,00,000 / month",
        difficulty: "Medium",
        duration: "1 - 2 Months",
        roadmap: [
            "Sharpen carpentry skills",
            "Set up a small workshop",
            "Buy tools & machinery",
            "Source quality wood",
            "Create a sample catalog",
            "Market on social media",
            "Take custom orders",
            "Build vendor tie-ups"
        ]
    },

    {
        id: 12,
        skill: "Carpentry",
        title: "Modular Kitchen & Interiors",
        description: "Design and install modular kitchens and interior woodwork.",
        investment: "₹2,00,000 - ₹6,00,000",
        income: "₹50,000 - ₹2,50,000 / month",
        difficulty: "Hard",
        duration: "2 - 3 Months",
        roadmap: [
            "Learn modular design tools",
            "Partner with hardware suppliers",
            "Create 3D sample designs",
            "Register your business",
            "Build a small installation team",
            "Advertise to interior designers",
            "Execute first projects",
            "Collect referrals"
        ]
    },

    {
        id: 13,
        skill: "Electrician",
        title: "Home Electrical Services",
        description: "Offer wiring, repair and installation services to households.",
        investment: "₹15,000 - ₹60,000",
        income: "₹20,000 - ₹60,000 / month",
        difficulty: "Easy",
        duration: "1 - 2 Weeks",
        roadmap: [
            "Get certified/licensed",
            "Buy essential tools",
            "List on local service apps",
            "Print visiting cards & flyers",
            "Serve first customers",
            "Ask for reviews",
            "Build repeat clients",
            "Hire assistants as you grow"
        ]
    },

    {
        id: 14,
        skill: "Electrician",
        title: "Electrical Contracting Business",
        description: "Take up wiring contracts for new buildings and commercial spaces.",
        investment: "₹1,00,000 - ₹5,00,000",
        income: "₹50,000 - ₹2,00,000 / month",
        difficulty: "Medium",
        duration: "1 - 2 Months",
        roadmap: [
            "Get a contractor license",
            "Hire a small crew",
            "Source materials wholesale",
            "Bid for small projects",
            "Complete pilot project",
            "Build builder relationships",
            "Register company formally",
            "Scale to bigger contracts"
        ]
    },

    {
        id: 15,
        skill: "Plumbing",
        title: "Home Plumbing Services",
        description: "Fix leaks, install fittings and handle plumbing repairs for homes.",
        investment: "₹15,000 - ₹50,000",
        income: "₹18,000 - ₹55,000 / month",
        difficulty: "Easy",
        duration: "1 - 2 Weeks",
        roadmap: [
            "Get trained/certified",
            "Buy plumbing toolkit",
            "List on local service apps",
            "Distribute flyers nearby",
            "Take first service calls",
            "Collect customer reviews",
            "Build a regular client base",
            "Add a helper for demand"
        ]
    },

    {
        id: 16,
        skill: "Plumbing",
        title: "Plumbing Supplies & Contracting",
        description: "Supply fittings and take up plumbing contracts for new constructions.",
        investment: "₹1,00,000 - ₹4,00,000",
        income: "₹40,000 - ₹1,50,000 / month",
        difficulty: "Medium",
        duration: "1 - 2 Months",
        roadmap: [
            "Study construction plumbing needs",
            "Source wholesale fittings",
            "Hire a small team",
            "Approach builders/contractors",
            "Complete a pilot project",
            "Register your business",
            "Build long-term contracts",
            "Expand inventory"
        ]
    },

    {
        id: 17,
        skill: "Mobile Repair",
        title: "Mobile Repair Shop",
        description: "Repair phone screens, batteries and hardware issues.",
        investment: "₹40,000 - ₹1,50,000",
        income: "₹20,000 - ₹70,000 / month",
        difficulty: "Easy",
        duration: "2 - 4 Weeks",
        roadmap: [
            "Learn repair techniques",
            "Buy tools & spare parts",
            "Rent a small shop/counter",
            "Get a repair certification",
            "List on Google/Justdial",
            "Serve first customers",
            "Stock popular spare parts",
            "Offer doorstep repair"
        ]
    },

    {
        id: 18,
        skill: "Mobile Repair",
        title: "Refurbished Phone Reselling",
        description: "Buy, repair and resell used smartphones online and locally.",
        investment: "₹1,00,000 - ₹5,00,000",
        income: "₹30,000 - ₹1,20,000 / month",
        difficulty: "Medium",
        duration: "1 Month",
        roadmap: [
            "Learn phone grading/testing",
            "Source used phones",
            "Set up repair workflow",
            "List on OLX/Quikr/marketplaces",
            "Price competitively",
            "Handle first sales",
            "Build supplier network",
            "Scale inventory"
        ]
    },

    {
        id: 19,
        skill: "Computer Skills",
        title: "Computer Training Institute",
        description: "Teach basic computer skills, MS Office and typing to students.",
        investment: "₹30,000 - ₹1,50,000",
        income: "₹25,000 - ₹90,000 / month",
        difficulty: "Easy",
        duration: "2 - 4 Weeks",
        roadmap: [
            "Design a course curriculum",
            "Set up a small computer lab",
            "Get study material ready",
            "Advertise in the neighborhood",
            "Enroll first batch",
            "Conduct classes",
            "Issue certificates",
            "Add advanced courses"
        ]
    },

    {
        id: 20,
        skill: "Computer Skills",
        title: "IT Support & AMC Services",
        description: "Provide computer repair and annual maintenance contracts to offices.",
        investment: "₹50,000 - ₹2,00,000",
        income: "₹35,000 - ₹1,20,000 / month",
        difficulty: "Medium",
        duration: "1 Month",
        roadmap: [
            "Build hardware/software expertise",
            "Buy diagnostic tools",
            "Approach local offices",
            "Offer a trial AMC",
            "Sign first contracts",
            "Build a support ticket system",
            "Hire a technician",
            "Expand client base"
        ]
    },

    {
        id: 21,
        skill: "Digital Marketing",
        title: "Social Media Marketing Agency",
        description: "Manage social media pages and ad campaigns for small businesses.",
        investment: "₹15,000 - ₹60,000",
        income: "₹25,000 - ₹1,00,000 / month",
        difficulty: "Easy",
        duration: "2 - 4 Weeks",
        roadmap: [
            "Learn social media tools",
            "Build your own portfolio page",
            "Pitch to local businesses",
            "Run a pilot campaign",
            "Show measurable results",
            "Sign monthly retainers",
            "Add ad-management services",
            "Scale to more clients"
        ]
    },

    {
        id: 22,
        skill: "Digital Marketing",
        title: "SEO & Performance Marketing",
        description: "Help businesses rank on Google and run performance ad campaigns.",
        investment: "₹30,000 - ₹1,50,000",
        income: "₹40,000 - ₹1,50,000 / month",
        difficulty: "Medium",
        duration: "1 Month",
        roadmap: [
            "Master SEO & Google Ads",
            "Get certified (Google/HubSpot)",
            "Build case studies",
            "Offer free audits to prospects",
            "Land first paying clients",
            "Track & report ROI",
            "Build long-term contracts",
            "Expand into an agency"
        ]
    },

    {
        id: 23,
        skill: "Handicrafts",
        title: "Handmade Craft Business",
        description: "Create and sell handmade decor, jewelry or gift items.",
        investment: "₹10,000 - ₹50,000",
        income: "₹12,000 - ₹45,000 / month",
        difficulty: "Easy",
        duration: "1 - 2 Weeks",
        roadmap: [
            "Perfect your craft technique",
            "Source raw materials",
            "Create a product catalog",
            "Set up an Instagram/Etsy shop",
            "Price your products",
            "Get first online orders",
            "Participate in local fairs",
            "Build a loyal customer base"
        ]
    },

    {
        id: 24,
        skill: "Handicrafts",
        title: "Handicraft Export Business",
        description: "Bulk produce and export traditional handicrafts.",
        investment: "₹1,50,000 - ₹6,00,000",
        income: "₹40,000 - ₹1,50,000 / month",
        difficulty: "Hard",
        duration: "2 - 3 Months",
        roadmap: [
            "Identify export-worthy crafts",
            "Get GST & export license",
            "Build artisan partnerships",
            "Create export-ready packaging",
            "List on export marketplaces",
            "Get first export order",
            "Handle logistics/documentation",
            "Scale production"
        ]
    },

    {
        id: 25,
        skill: "Agriculture",
        title: "Organic Vegetable Farming",
        description: "Grow and sell organic vegetables directly to local customers.",
        investment: "₹50,000 - ₹2,00,000",
        income: "₹25,000 - ₹80,000 / month",
        difficulty: "Medium",
        duration: "2 - 3 Months",
        roadmap: [
            "Test soil & plan crops",
            "Arrange land/water access",
            "Buy seeds & organic inputs",
            "Set up basic irrigation",
            "Grow first crop cycle",
            "Sell via local markets/apps",
            "Build direct customer base",
            "Add more crop varieties"
        ]
    },

    {
        id: 26,
        skill: "Agriculture",
        title: "Agri Produce Processing Unit",
        description: "Process farm produce into pickles, flour or packaged foods.",
        investment: "₹1,00,000 - ₹4,00,000",
        income: "₹35,000 - ₹1,20,000 / month",
        difficulty: "Medium",
        duration: "1 - 2 Months",
        roadmap: [
            "Choose a processed product line",
            "Get FSSAI license",
            "Buy processing equipment",
            "Design packaging & branding",
            "Produce first batch",
            "Sell via local stores/online",
            "Gather customer feedback",
            "Scale distribution"
        ]
    },

    {
        id: 27,
        skill: "Painting",
        title: "House Painting Services",
        description: "Offer interior and exterior painting services for homes.",
        investment: "₹20,000 - ₹80,000",
        income: "₹20,000 - ₹70,000 / month",
        difficulty: "Easy",
        duration: "1 - 2 Weeks",
        roadmap: [
            "Master painting techniques",
            "Buy tools & equipment",
            "Build a small crew",
            "Create a price list",
            "Advertise locally",
            "Complete first projects",
            "Collect before/after photos",
            "Build repeat business"
        ]
    },

    {
        id: 28,
        skill: "Painting",
        title: "Art & Custom Mural Business",
        description: "Create custom paintings, murals and wall art for homes and cafes.",
        investment: "₹15,000 - ₹60,000",
        income: "₹18,000 - ₹60,000 / month",
        difficulty: "Medium",
        duration: "2 - 4 Weeks",
        roadmap: [
            "Build an art portfolio",
            "Showcase work on Instagram",
            "Price your commissions",
            "Reach out to cafes/homeowners",
            "Complete first mural",
            "Document the process online",
            "Take custom commissions",
            "Expand to bigger projects"
        ]
    },

    {
        id: 29,
        skill: "Content Writing",
        title: "Freelance Content Writing",
        description: "Write blogs, website content and articles for clients.",
        investment: "₹5,000 - ₹20,000",
        income: "₹15,000 - ₹60,000 / month",
        difficulty: "Easy",
        duration: "1 - 2 Weeks",
        roadmap: [
            "Sharpen writing skills",
            "Build a writing portfolio",
            "Join freelance platforms",
            "Pitch to blogs/businesses",
            "Deliver first articles",
            "Collect testimonials",
            "Raise your per-word rate",
            "Land retainer clients"
        ]
    },

    {
        id: 30,
        skill: "Content Writing",
        title: "Content Agency & Copywriting",
        description: "Run a small team producing website copy and marketing content.",
        investment: "₹30,000 - ₹1,00,000",
        income: "₹35,000 - ₹1,20,000 / month",
        difficulty: "Medium",
        duration: "1 Month",
        roadmap: [
            "Master copywriting fundamentals",
            "Hire junior writers",
            "Build a content portfolio site",
            "Pitch to agencies/startups",
            "Deliver a pilot project",
            "Set up a content workflow",
            "Sign monthly retainers",
            "Scale the team"
        ]
    },

    {
        id: 31,
        skill: "Video Editing",
        title: "Freelance Video Editing",
        description: "Edit YouTube videos, reels and ads for content creators.",
        investment: "₹20,000 - ₹80,000",
        income: "₹20,000 - ₹70,000 / month",
        difficulty: "Easy",
        duration: "2 - 4 Weeks",
        roadmap: [
            "Master editing software",
            "Build a demo reel",
            "List on freelance platforms",
            "Reach out to small creators",
            "Deliver first edited videos",
            "Collect testimonials",
            "Raise your rates",
            "Take on retainer clients"
        ]
    },

    {
        id: 32,
        skill: "Video Editing",
        title: "Video Production Studio",
        description: "Offer full shoot-and-edit services for businesses and events.",
        investment: "₹1,50,000 - ₹5,00,000",
        income: "₹40,000 - ₹1,80,000 / month",
        difficulty: "Medium",
        duration: "1 - 2 Months",
        roadmap: [
            "Invest in camera & lighting gear",
            "Build a portfolio reel",
            "Hire an editing assistant",
            "Pitch to local businesses",
            "Shoot first paid project",
            "Deliver polished output",
            "Get client referrals",
            "Expand equipment & team"
        ]
    },

];

export default businesses;