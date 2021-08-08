/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-case-declarations */
/* eslint-disable no-console */
/* eslint-disable no-undef */
const FormData = require('form-data');

const fetch = require('node-fetch');
const xpath = require('xpath-html');
const _ = require('lodash');
const mongoose = require('mongoose');
const { CoPhimLinkLe, CoPhimFeatureMovie } = require('../models');

const getDownloadLinksAndSubtitles = async (id) => {
  const form = new FormData();
  form.append('action', 'apiFilmAjaxPagi');
  form.append('postID', id);
  const response = await fetch('http://cophim.com/wp-admin/admin-ajax.php', { method: 'POST', body: form });
  const data = await response.json();

  return { ...data, id };
};

const getMovieDetails = async (thumbnailLink) => {
  const origin = thumbnailLink.link;
  console.log(`Fetching ${origin} ...`);
  let year;
  let country;
  let vnTitle;
  let enTitle;
  let watch = [];
  let description;
  const group = 'Phim lẻ chọn lọc';
  let tags = [];
  let posterImg = '';
  let res = await fetch(origin);
  if (res.status === 200) {
    res = await res.text();
    try {
      console.log('Getting year and country and title...');
      const doc = xpath.fromPageSource(res);
      year = doc.findElement("//a[contains(@href, 'namsanxuat') and @rel='tag']");
      year = !_.isEmpty(year) ? year.getText() : 'NA';
      country = doc.findElement("//a[contains(@href, 'quoc-gia') and @rel='tag']");
      country = country ? country.getText() : 'NA';
      vnTitle = doc.findElement("//h1[@itemprop='name']");
      vnTitle = !_.isEmpty(vnTitle) ? vnTitle.getText() : 'NA';

      tags = doc.findElements("//a[contains(@href, 'the-loai') and contains(@rel, 'category')]");
      if (tags && tags.length > 0) {
        tags = tags.map((item) => item.getText());
      } else tags = [];
      description = doc.findElement("//meta[contains(@property, 'og:description')]");
      description = description.getAttribute('content');
      if (_.isEmpty(description)) {
        description = doc.findElement("//p[contains(@class, 'content-film')]");
        description = description.getText();
      }
      enTitle = doc.findElement("//h2[contains(@class, 'title-film-detail-2')]");
      if (_.isEmpty(enTitle)) {
        enTitle = doc.findElement("//p[contains(@class, 'text-sub')]");
        enTitle = _.isEmpty(enTitle) ? 'NA' : enTitle.getText();
      } else enTitle = enTitle.getText();
      posterImg = doc.findElement("//meta[contains(@property, 'og:image')]");
      posterImg = posterImg.getAttribute('content');
    } catch (e) {
      console.log('Warning: ', origin);
    }

    // get download links & subtitles
    watch = [];
    const watchUrl = origin.replace('cophim.com', 'cophim.com/phim');
    res = await fetch(watchUrl);
    console.log(`Fetching ${watchUrl} ...`);
    let manual = false;
    let links = [];
    if (res.status === 200) {
      let getLinkFailed = false;
      try {
        res = await res.text();
        console.log('Getting download links');
        links = xpath.fromPageSource(res).findElements("//a[@data-id and contains(@ng-click, 'topplayer')]");
        if (!links || !links.length) {
          const link = xpath.fromPageSource(res).findElement("//input[contains(@id, 'postID')]");
          links = [link];
        }
        if (!links || !links.length) {
          manual = true;
        }
        await Promise.all(
          links.map(async (link) => {
            const id = manual ? 'xxxxxx' : link.getAttribute('data-id') || link.getAttribute('value');
            const watchLink = manual
              ? {
                  link: 'xxxxxx',
                  getlink: 'xxxxxx',
                  linkFilm: origin,
                  title: 'xxxxxx',
                  id,
                }
              : await getDownloadLinksAndSubtitles(id);
            watch.push(watchLink);
            return watchLink;
          })
        ).then((results) => {
          watch = results;
          return results;
        });
        getLinkFailed = false;
      } catch (e) {
        console.log(e);
        const failed = await CoPhimLinkLe.findById(thumbnailLink.id);
        Object.assign(failed, { status: 2 });
        await failed.save();
        getLinkFailed = true;
      }
      if (!getLinkFailed) {
        try {
          const find = await CoPhimFeatureMovie.find({ thumbnailLink: thumbnailLink.id });
          console.log(find);
          if (!_.isEmpty(find)) {
            console.log(find);
            const link = await CoPhimLinkLe.findById(thumbnailLink.id);
            Object.assign(link, { status: 1 });
            await link.save();
          } else {
            const mv = await CoPhimFeatureMovie.create({
              thumbnailLink: thumbnailLink.id,
              year,
              country,
              vnTitle,
              enTitle,
              videoLinks: watch,
              tags,
              description,
              postUrl: thumbnailLink.link,
              posterImg,
            });
            console.log(mv);
            const link = await CoPhimLinkLe.findById(thumbnailLink.id);
            Object.assign(link, { status: 1 });
            await link.save();
          }
        } catch (e) {
          const link = await CoPhimLinkLe.findById(thumbnailLink.id);
          Object.assign(link, { status: 2 });
          await link.save();
        }
      }
      return { year, country, vnTitle, enTitle, watch, group, tags, description };
    }
    console.log(`Fetch failed. Check ${watchUrl}`);
    return {};
  }
  console.log(`Fetch failed. Check ${origin}`);
  return {};
};
const crawl20FeatureMovies = async (status = 0, sort = { _id: 1 }) => {
  // Get first 20 feature movie links to crawl
  const first20Items = await CoPhimLinkLe.find({ status: { $in: [status] } }, null, { sort: sort }, () => {}).limit(20);
  for (let i = 0; i < 20; i++) {
    await getMovieDetails(first20Items[i]);
  }
  console.log('Done 20 links ...');
  return 0;
};
const setup = async () => {
  await mongoose.connect(
    'mongodb://usshjtu1qwhudmextla5:tpx4REUYFvKcSwqyieXJ@b0mbi3dgptznjta-mongodb.services.clever-cloud.com:27017/b0mbi3dgptznjta',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  );
  console.log('DB connected ...');
};
// console.time('dbsave');
// setup();
// crawl20FeatureMovies();
// console.timeEnd('dbsave');
// module.exports = {
//   crawl20FeatureMovies,
// };
module.exports = {
  crawl20FeatureMovies,
  setup,
};
