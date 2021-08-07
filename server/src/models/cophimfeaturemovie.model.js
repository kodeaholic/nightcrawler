const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Schema = mongoose.Schema;
const Link = mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
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

const cophimfeaturemovie = mongoose.Schema(
  {
    thumbnailLink: {
      type: Schema.Types.ObjectId,
      ref: 'CoPhimLinkLe',
      required: true,
      trim: true,
      unique: true,
    },
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
    videoLinks: {
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
    postUrl: {
      type: String,
      required: false,
    },
    posterImg: {
      type: String,
      required: false,
    },
    published: {
      type: Number,
      required: false,
      default: 0,
    },
    publishedUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cophimfeaturemovie.plugin(toJSON);
cophimfeaturemovie.plugin(paginate);

/**
 * @typedef CoPhimFeatureMovie
 */
const CoPhimFeatureMovie = mongoose.model('CoPhimFeatureMovie', cophimfeaturemovie);

module.exports = CoPhimFeatureMovie;
