const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const cophimlinkle = mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: Number,
      required: true,
      trim: false,
      default: 0,
    },
    thumb: {
      type: String,
      required: false,
      trim: false,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cophimlinkle.plugin(toJSON);
cophimlinkle.plugin(paginate);


/**
 * @typedef CoPhimLinkLe
 */
const CoPhimLinkLe = mongoose.model('CoPhimLinkLe', cophimlinkle);

module.exports = CoPhimLinkLe;
