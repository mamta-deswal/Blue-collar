const express = require("express");
const { registerLabor, searchLaborers } = require("../controllers/Laborer");

const router = express.Router();

router.post("/register-labor", registerLabor);
router.get("/search-laborers", searchLaborers);

module.exports = router;
