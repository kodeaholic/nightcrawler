const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const failedLinksSchema = mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
failedLinksSchema.plugin(toJSON);
failedLinksSchema.plugin(paginate);

// /**
//  * Check if email is taken
//  * @param {string} email - The user's email
//  * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
//  * @returns {Promise<boolean>}
//  */
// failedLinksSchema.statics.isEmailTaken = async function (email, excludeUserId) {
//   const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
//   return !!user;
// };

/**
 * @typedef FailedMovie
 */
const FailedMovie = mongoose.model('FailedMovie', failedLinksSchema);

module.exports = FailedMovie;
