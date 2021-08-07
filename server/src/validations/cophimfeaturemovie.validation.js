const Joi = require('joi');
const { objectId } = require('./custom.validation');

const LinkValidation = {
  id: Joi.string(),
  link: Joi.string(),
  trackUrl: Joi.string(),
  getlink: Joi.string(),
  linkFilm: Joi.string(),
  title: Joi.string(),
};

const createItem = {
  body: Joi.object().keys({
    thumbnailLink: Joi.string().custom(objectId).required(),
    year: Joi.number(),
    country: Joi.string(),
    vnTitle: Joi.string(),
    enTitle: Joi.string(),
    videoLinks: Joi.array().items(LinkValidation),
    tags: Joi.array(),
    description: Joi.string(),
    postUrl: Joi.string(),
    posterImg: Joi.string(),
    published: Joi.number(),
    publishedUrl: Joi.string(),
  }),
};

const getItems = {
  query: Joi.object().keys({
    year: Joi.string(),
    country: Joi.string(),
    published: Joi.number(),
    vnTitle: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const updateItem = {
  params: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      thumbnailLink: Joi.string().custom(objectId).required(),
      year: Joi.number(),
      country: Joi.string(),
      vnTitle: Joi.string(),
      enTitle: Joi.string(),
      videoLinks: Joi.array().items(LinkValidation),
      tags: Joi.array(),
      description: Joi.string(),
      postUrl: Joi.string(),
      posterImg: Joi.string(),
      published: Joi.number(),
      publishedUrl: Joi.string(),
    })
    .min(1),
};

const deleteItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
};
