const express = require('express');

const blogController = require('../controllers/blog');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/blog', blogController.getPublicaciones);
router.get('/crear-publicacion', isAuth, blogController.getCrearPublicacion);
router.post('/crear-publicacion', isAuth, blogController.postCrearPublicacion);

module.exports = router;