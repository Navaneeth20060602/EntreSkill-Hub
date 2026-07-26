const express = require("express");
const { getLearningResource } = require("../controllers/learningController");

const router = express.Router();

router.get("/:businessId", getLearningResource);

module.exports = router;
