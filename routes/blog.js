const express = require('express');

const blogController = require('../controllers/blog');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/blog', blogController.getPublicaciones);

module.exports = router;