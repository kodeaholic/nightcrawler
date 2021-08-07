const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const validation = require('../../validations/cophimlinkle.validation');
const controller = require('../../controllers/cophimlinkle.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageItems'), validate(validation.createItem), controller.createItem)
  .get(auth('getItems'), validate(validation.getItems), controller.getItems);

router
  .route('/:itemId')
  .get(auth('getItems'), validate(validation.getItem), controller.getItem)
  .patch(auth('manageItems'), validate(validation.updateItem), controller.updateItem)
  .delete(auth('manageItems'), validate(validation.deleteItem), controller.deleteItem);

module.exports = router;