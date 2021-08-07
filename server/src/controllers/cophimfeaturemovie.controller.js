const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cophimfeaturemovieService } = require('../services');

const createItem = catchAsync(async (req, res) => {
  const item = await cophimfeaturemovieService.createItem(req.body);
  res.status(httpStatus.CREATED).send(item);
});

const getItems = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['year', 'country', 'published', 'vnTitle']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await cophimfeaturemovieService.queryItems(filter, options);
  res.send(result);
});

const getItem = catchAsync(async (req, res) => {
  const item = await cophimfeaturemovieService.getItemById(req.params.itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  res.send(item);
});

const updateItem = catchAsync(async (req, res) => {
  const item = await cophimfeaturemovieService.updateItemById(req.params.itemId, req.body);
  res.send(item);
});

const deleteItem = catchAsync(async (req, res) => {
  await cophimfeaturemovieService.deleteItemById(req.params.itemId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
};
