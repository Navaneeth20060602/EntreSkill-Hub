require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
});

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`EntreSkill Hub API running on http://localhost:${PORT}`);
  });
}

start();
