const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const Link = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: false,
    },
    link: {
      type: String,
      required: false,
      trim: false,
    },
    trackUrl: {
      type: String,
      required: false,
      trim: false,
    },
    getlink: {
      type: String,
      required: false,
      trim: false,
    },
    linkFilm: {
      type: String,
      required: false,
      trim: false,
    },
    title: {
      type: String,
      required: false,
      trim: false,
    },
  },
  { _id: false }
);

const movieSchema = mongoose.Schema(
  {
    year: {
      type: String,
      required: false,
      trim: true,
    },
    country: {
      type: String,
      required: false,
      trim: true,
    },
    vnTitle: {
      type: String,
      trim: true,
      required: false,
    },
    enTitle: {
      type: String,
      trim: true,
      required: false,
    },
    watch: {
      type: [Link],
      required: false,
    },
    tags: {
      type: [String],
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    thumb: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
movieSchema.plugin(toJSON);
movieSchema.plugin(paginate);

// /**
//  * Check if email is taken
//  * @param {string} email - The user's email
//  * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
//  * @returns {Promise<boolean>}
//  */
// movieSchema.statics.isEmailTaken = async function (email, excludeUserId) {
//   const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
//   return !!user;
// };

/**
 * @typedef Movie
 */
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
