const express = require("express");
const { estimate } = require("../controllers/calculatorController");

const router = express.Router();

router.post("/estimate", estimate);

module.exports = router;
