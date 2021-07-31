const express = require('express');
const { crawlController } = require('../../controllers');

const router = express.Router();

router.route('/').get(crawlController.index);

module.exports = router;
