const path = require("path");
require("dotenv").config({
  path: path.join(
    __dirname,
    "..",
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
  ),
});
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// Safety lock: this script deletes and recreates demo data. It must
// never run against the live production database by accident. To run it
// on purpose in production, you'd have to explicitly set
// ALLOW_PROD_SEED=true as an environment variable first.
if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_PROD_SEED !== "true"
) {
  console.log(
    "Refusing to run seed.js in production without ALLOW_PROD_SEED=true. Exiting safely.",
  );
  process.exit(0);
}

// Same catalog the client used to keep locally as static mock data
// (client/src/data/*.js), now living in the database so the frontend
// and backend agree on one source of truth.
const businesses = [
  {
    title: "Home Catering",
    skill: "Cooking",
    description: "Prepare homemade meals for families and offices.",
    investment: "₹30,000 - ₹1,00,000",
    income: "₹25,000 - ₹80,000 / month",
    difficulty: "Easy",
    duration: "2 - 4 Weeks",
    requiredSkills: [
      "Communication",
      "Customer Handling",
      "Business Planning",
      "Marketing",
    ],
    roadmapSteps: [
      "Learn food safety",
      "Plan your menu",
      "Calculate investment",
      "Buy kitchen equipment",
      "Register your business",
      "Create social media pages",
      "Partner with Swiggy/Zomato",
      "Serve first customers",
    ],
    learningResource: {
      skills: [
        "Food Safety & Hygiene",
        "Menu Planning",
        "Customer Service",
        "Pricing Strategy",
      ],
      courses: [
        "Beginner Food Business",
        "Advanced Catering Management",
        "Digital Marketing for Food Businesses",
      ],
      pdfs: [
        "Food Safety Guide",
        "FSSAI Registration Guide",
        "Pricing Handbook",
      ],
      certifications: ["FSSAI Food Safety", "Food Handling Certificate"],
      youtube: [
        {
          title: "How to Start a Home Catering Business",
          url: "https://www.youtube.com/results?search_query=home+catering+business",
        },
        {
          title: "Food Business Marketing",
          url: "https://www.youtube.com/results?search_query=food+business+marketing",
        },
        {
          title: "FSSAI Registration Guide",
          url: "https://www.youtube.com/results?search_query=fssai+registration",
        },
      ],
    },
  },
  {
    title: "Cloud Kitchen",
    skill: "Cooking",
    description: "Run a delivery-only restaurant from your kitchen.",
    investment: "₹1,50,000 - ₹5,00,000",
    income: "₹50,000 - ₹2,00,000 / month",
    difficulty: "Medium",
    duration: "1 - 2 Months",
    requiredSkills: [
      "Communication",
      "Customer Handling",
      "Business Planning",
      "Marketing",
    ],
    roadmapSteps: [
      "Research food demand",
      "Choose cuisine",
      "Purchase equipment",
      "Get FSSAI License",
      "Register on Swiggy/Zomato",
      "Create branding",
      "Launch marketing",
      "Start delivery",
    ],
    learningResource: {
      skills: [
        "Kitchen Management",
        "Online Food Delivery",
        "Branding",
        "Inventory Management",
      ],
      courses: ["Cloud Kitchen Masterclass", "Restaurant Management"],
      pdfs: ["Cloud Kitchen Startup Guide", "Restaurant Operations"],
      certifications: ["Food Safety", "Kitchen Operations"],
      youtube: [
        {
          title: "Start a Cloud Kitchen",
          url: "https://www.youtube.com/results?search_query=cloud+kitchen+business",
        },
        {
          title: "Cloud Kitchen Marketing",
          url: "https://www.youtube.com/results?search_query=cloud+kitchen+marketing",
        },
      ],
    },
  },
  {
    title: "Bakery",
    skill: "Cooking",
    description: "Sell cakes, cookies and baked snacks.",
    investment: "₹2,00,000 - ₹8,00,000",
    income: "₹40,000 - ₹2,50,000 / month",
    difficulty: "Medium",
    duration: "2 - 3 Months",
    requiredSkills: [
      "Communication",
      "Customer Handling",
      "Business Planning",
      "Marketing",
    ],
    roadmapSteps: [
      "Learn baking",
      "Purchase oven",
      "Create menu",
      "Get food license",
      "Market online",
      "Start selling",
      "Collect reviews",
      "Expand business",
    ],
    learningResource: {
      skills: ["Baking", "Cake Decoration", "Customer Service", "Inventory"],
      courses: ["Professional Baking"],
      pdfs: ["Bakery Startup Guide"],
      certifications: ["Bakery & Confectionery"],
      youtube: [
        {
          title: "Bakery Business Guide",
          url: "https://www.youtube.com/results?search_query=bakery+business",
        },
      ],
    },
  },
  {
    title: "Photography Studio",
    skill: "Photography",
    description: "Offer portrait and commercial photography.",
    investment: "₹1,00,000 - ₹5,00,000",
    income: "₹40,000 - ₹2,00,000 / month",
    difficulty: "Medium",
    duration: "1 - 2 Months",
    requiredSkills: [
      "Communication",
      "Customer Handling",
      "Business Planning",
      "Marketing",
    ],
    roadmapSteps: [
      "Master camera skills",
      "Build portfolio",
      "Buy equipment",
      "Register business",
      "Create website",
      "Market services",
      "Book first clients",
      "Expand portfolio",
    ],
    learningResource: {
      skills: [
        "Camera Handling",
        "Lighting",
        "Photo Editing",
        "Client Communication",
      ],
      courses: ["Photography Masterclass"],
      pdfs: ["Photography Business Guide"],
      certifications: ["Adobe Lightroom", "Adobe Photoshop"],
      youtube: [
        {
          title: "Photography Business",
          url: "https://www.youtube.com/results?search_query=photography+business",
        },
      ],
    },
  },
  {
    title: "Wedding Photography",
    skill: "Photography",
    description: "Capture weddings and special occasions.",
    investment: "₹2,00,000 - ₹6,00,000",
    income: "₹80,000 - ₹3,00,000 / month",
    difficulty: "Medium",
    duration: "2 Months",
    requiredSkills: [
      "Communication",
      "Customer Handling",
      "Business Planning",
      "Marketing",
    ],
    roadmapSteps: [
      "Practice wedding shoots",
      "Buy professional gear",
      "Build portfolio",
      "Partner with event planners",
      "Advertise services",
      "Book weddings",
      "Collect testimonials",
      "Grow team",
    ],
    learningResource: {
      skills: ["Wedding Photography", "Editing", "Album Design"],
      courses: ["Wedding Photography Pro"],
      pdfs: ["Wedding Photography Handbook"],
      certifications: ["Professional Photographer"],
      youtube: [
        {
          title: "Wedding Photography Tips",
          url: "https://www.youtube.com/results?search_query=wedding+photography",
        },
      ],
    },
  },
  {
    title: "Coaching Center",
    skill: "Teaching",
    description: "Teach students through offline or online classes.",
    investment: "₹20,000 - ₹2,00,000",
    income: "₹30,000 - ₹1,50,000 / month",
    difficulty: "Easy",
    duration: "2 Weeks",
    requiredSkills: [
      "Communication",
      "Customer Handling",
      "Business Planning",
      "Marketing",
    ],
    roadmapSteps: [
      "Choose subject",
      "Prepare syllabus",
      "Create study material",
      "Advertise locally",
      "Enroll students",
      "Conduct classes",
      "Collect feedback",
      "Expand batches",
    ],
    learningResource: {
      skills: ["Teaching", "Lesson Planning", "Public Speaking"],
      courses: ["Teaching Masterclass"],
      pdfs: ["Teaching Business Guide"],
      certifications: ["Teacher Training"],
      youtube: [
        {
          title: "Start a Coaching Center",
          url: "https://www.youtube.com/results?search_query=coaching+center+business",
        },
      ],
    },
  },
];

const mentors = [
  {
    name: "Rahul Sharma",
    specialization: "Cooking",
    experience: "12 Years",
    rating: 4.9,
    location: "Hyderabad",
    email: "rahul@example.com",
  },
  {
    name: "Priya Reddy",
    specialization: "Photography",
    experience: "8 Years",
    rating: 4.8,
    location: "Bangalore",
    email: "priya@example.com",
  },
  {
    name: "Anil Kumar",
    specialization: "Teaching",
    experience: "15 Years",
    rating: 4.7,
    location: "Chennai",
    email: "anil@example.com",
  },
  {
    name: "Sneha Gupta",
    specialization: "Cooking",
    experience: "10 Years",
    rating: 4.8,
    location: "Delhi",
    email: "sneha@example.com",
  },
];

// General, informational summaries of well-known Indian government schemes
// for micro-entrepreneurs. Kept short and non-authoritative on purpose -
// users are pointed to the official link for anything binding.
const schemes = [
  {
    name: "PMEGP (Prime Minister's Employment Generation Programme)",
    description:
      "A credit-linked subsidy scheme that helps first-time entrepreneurs set up new micro-enterprises.",
    eligibility:
      "Individuals aged 18+ planning a new micro-enterprise; educational criteria vary by project cost.",
    link: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
  },
  {
    name: "PM Mudra Yojana",
    description:
      "Offers collateral-free loans up to ₹10 lakh (Shishu, Kishor, Tarun categories) for small and micro businesses.",
    eligibility:
      "Non-corporate, non-farm small and micro enterprises engaged in income-generating activities.",
    link: "https://www.mudra.org.in/",
  },
  {
    name: "Stand-Up India",
    description:
      "Facilitates bank loans between ₹10 lakh and ₹1 crore for setting up greenfield enterprises.",
    eligibility:
      "SC/ST and women entrepreneurs above 18 years, for greenfield projects.",
    link: "https://www.standupmitra.in/",
  },
  {
    name: "PM SVANidhi",
    description:
      "Provides affordable working-capital loans to street vendors to resume and grow their businesses.",
    eligibility:
      "Street vendors in urban areas holding a vending certificate or identity card.",
    link: "https://pmsvanidhi.mohua.gov.in/",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const businessData of businesses) {
    const { learningResource, ...business } = businessData;

    const created = await prisma.businessIdea.upsert({
      where: { title: business.title },
      update: business,
      create: business,
    });

    await prisma.learningResource.upsert({
      where: { businessId: created.id },
      update: learningResource,
      create: { ...learningResource, businessId: created.id },
    });
  }

  // --- Demo login accounts for the Admin and Mentor dashboards ---
  // Change these passwords after your first login in production.
  const demoPasswordHash = await bcrypt.hash("Demo@123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@entreskillhub.com" },
    update: { role: "ADMIN" },
    create: {
      fullName: "Site Admin",
      email: "admin@entreskillhub.com",
      mobile: "9000000001",
      mobileVerified: true,
      passwordHash: demoPasswordHash,
      role: "ADMIN",
    },
  });

  const mentorUser = await prisma.user.upsert({
    where: { email: "rahul@example.com" },
    update: { role: "MENTOR" },
    create: {
      fullName: "Rahul Sharma",
      email: "rahul@example.com",
      mobile: "9000000002",
      mobileVerified: true,
      passwordHash: demoPasswordHash,
      role: "MENTOR",
    },
  });

  for (const mentorData of mentors) {
    const existingMentor = await prisma.mentor.findFirst({
      where: { email: mentorData.email },
    });
    const data = {
      ...mentorData,
      userId:
        mentorData.email === "rahul@example.com" ? mentorUser.id : undefined,
    };

    if (existingMentor) {
      await prisma.mentor.update({ where: { id: existingMentor.id }, data });
    } else {
      await prisma.mentor.create({ data });
    }
  }

  console.log("Demo admin login: admin@entreskillhub.com / Demo@123");
  console.log("Demo mentor login: rahul@example.com / Demo@123");

  for (const scheme of schemes) {
    const existingScheme = await prisma.governmentScheme.findFirst({
      where: { name: scheme.name },
    });
    if (existingScheme) {
      await prisma.governmentScheme.update({
        where: { id: existingScheme.id },
        data: scheme,
      });
    } else {
      await prisma.governmentScheme.create({ data: scheme });
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
