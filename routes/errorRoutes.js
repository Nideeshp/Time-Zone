const express = require('express');
const router = express.Router();

// Import the errorController
const { errorController } = require('../Controllers/errorController');

// 404 Error Page
router.use((req, res, next) => {
  errorController(req, res, next);
});

module.exports = router;
