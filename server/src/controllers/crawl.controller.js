const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const main = require('../crawler/fetch');

const index = catchAsync(async (req, res) => {
  await main();
  res.send({});
});

module.exports = {
  index,
};
