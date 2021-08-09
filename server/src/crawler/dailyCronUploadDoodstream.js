const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;
const request = require('request');
const _ = require('lodash');
const { CoPhimFeatureMovie } = require('../models');
const FOLDER_ID = '217479';
const API_KEY = '45272rxw8pcvz16k13dyy';
const API_END_POINT = `https://doodapi.com/api/upload/url?key=${API_KEY}&url=REPLACE_URL&fld_id=${FOLDER_ID}&new_title=REPLACE_TITLE`;
const METHOD = 'GET';
const uploadFilePromise = (movie) => {
  // Download first
  return new Promise((resolve) => {
    const upload = async () => {
      if (
        /hydrax.net/.test(movie.link) ||
        _.isEmpty(movie.link) ||
        (/hdviet/.test(movie.link) && /html/.test(movie.link)) ||
        /vtvhub/.test(movie.link) ||
        /m3u8/.test(movie.link) ||
        /tvzingvn/.test(movie.link) ||
        /demo.apicodes.com/.test(movie.link) ||
        /api.khophimle.co/.test(movie.link) ||
        /database.gdriveplayer.me/.test(movie.link) ||
        /Khophimle.tv/.test(movie.link) ||
        /gdrivecdn.us/.test(movie.link) ||
        /cdn.apidev.icu/.test(movie.link) ||
        /xemcloud.me/.test(movie.link) ||
        /cophim.com\/phim/.test(movie.link) ||
        /xomphimhay.com/.test(movie.link) ||
        /bapnuoctv.com/.test(movie.link) ||
        /khoaitv.org/.test(movie.link) ||
        /playhydrax.com/.test(movie.link) ||
        /ostreamcdn.com/.test(movie.link) ||
        /xemhdphim.com/.test(movie.link) ||
        /hdviet.com/.test(movie.link) ||
        /phimmoi.net/.test(movie.link) ||
        /photos.google.com/.test(movie.link) ||
        /oloadcdn.net/.test(movie.link)
      ) {
        // ignored
        const updatedMovie = await CoPhimFeatureMovie.findById(movie.id);
        const videoLinks = updatedMovie.videoLinks;
        const index = _.findIndex(videoLinks, function (item) {
          return item.id === movie.linkId;
        });
        updatedMovie.videoLinks[index].queued = 1;
        await updatedMovie.save();
        console.log('Ignored hydrax.net link and empty link ...');
        resolve(movie.id);
      } else {
        // generate title of movie
        let title = movie.title;
        if (!_.isEmpty(title)) title = [movie.vnTitle, movie.enTitle].filter(Boolean).join(' - ');
        title += `|${movie.id}|${movie.linkId}`;
        console.log('New title: ', title);
        let URI = API_END_POINT.replace('REPLACE_URL', movie.link);
        URI = URI.replace('REPLACE_TITLE', title);
        URI = URI.replace(/[{()}]/g, '');
        const encodedURI = encodeURI(URI);
        let res = await fetch(encodedURI, { method: METHOD });
        let data = await res.json();
        if (data.msg === 'OK' && data.status === 200) {
          // update DB
          const updatedMovie = await CoPhimFeatureMovie.findById(movie.id);
          const videoLinks = updatedMovie.videoLinks;
          const index = _.findIndex(videoLinks, function (item) {
            return item.id === movie.linkId;
          });
          updatedMovie.videoLinks[index].queued = 1;
          updatedMovie.videoLinks[index].doodstreamCode = data.result.filecode;
          await updatedMovie.save();
          console.log(updatedMovie);
          resolve(movie.id);
        } else {
          console.log('Failed to upload to doodstream. Ignoring ...');
          const updatedMovie = await CoPhimFeatureMovie.findById(movie.id);
          const videoLinks = updatedMovie.videoLinks;
          const index = _.findIndex(videoLinks, function (item) {
            return item.id === movie.linkId;
          });
          updatedMovie.videoLinks[index].queued = 1;
          await updatedMovie.save();
          resolve(movie.id);
        }
      }
    };
    try {
      upload();
    } catch (e) {
      console.log(e);
      resolve(movie.id);
    }
  });
};

const main = async () => {
  process.setMaxListeners(0);
  if (!mongoose.connection.readyState) {
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
  }

  console.log('Getting 30 movies ...');
  const first30Items = await CoPhimFeatureMovie.find({
    $and: [{ 'videoLinks.queued': { $ne: 1 } }],
  }).limit(30);
  let promises = [];
  let movies = [];
  first30Items.map((item) => {
    if (item.videoLinks && item.videoLinks.length) {
      const links = item.videoLinks;
      links.map((link) => {
        console.log(link.link);
        const movie = {
          vnTitle: item.vnTitle,
          enTitle: item.enTitle,
          link: link.link,
          linkId: link.id,
          title: link.title,
          id: item.id,
        };
        movies.push(movie);
      });
    }
  });
  // console.log(movies);
  // process.exit(0);
  promises = movies.map((item) => uploadFilePromise(item));
  Promise.all(promises)
    .then((results) => {
      console.log(results);
      //process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      console.timeEnd('MAIN');
      //process.exit(0);
    });
  return;
};

// main();

const job = new CronJob(
  '0 */1 * * * *',
  function () {
    console.log('Every 1 minutes ----- Run job');
    try {
      main();
    } catch (e) {
      console.log(e);
      process.exit(0);
    }
  },
  null,
  true,
  'Asia/Ho_Chi_Minh'
);
job.start();
