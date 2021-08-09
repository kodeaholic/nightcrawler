const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;
const request = require('request');
const _ = require('lodash');
const { CoPhimFeatureMovie } = require('../models');
const DOODSTREAM_API_END_POINT = 'https://doodapi.com/api/file/info?key=45272rxw8pcvz16k13dyy&file_code=REPLACE_CODE';
const BLOGGER_API_END_POINT = `https://www.googleapis.com/blogger/v3/blogs/999944992553436616/posts?key=AIzaSyC73L0579-h7XctQ3nNbXA53IwKVoKiSOI`;
const DEFAULT_POSTER =
  'https://1.bp.blogspot.com/-5TQJWgo7ai0/YRDqXTVaC1I/AAAAAAAAEVc/NsWGq3VUm2YjEtxEbaj--4NCv0KwHXbowCLcBGAsYHQ/s600/default.jpeg';
const DEFAULT_IFRAME = `<iframe width="600" height="480" src="https://dood.la/e/nvxor1okzzs62sqg0j0r4iltkz7saxlp" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>
`;
const BLOG_OAUTH_TOKEN = `ya29.a0ARrdaM9mB50bJHB-Pf7dH_9fJlKRkVhyALQugqOpPYwiMDJmx3HkbGIv6H03n4vpEg77XH_yaAr5IkDT9r547B2gQd9OFianJ49P3fxk9cNLXCNsaG4Fb8eivjAEPVz98CoS3CZA0pdi1Iomo_a8mKoFhl4R`;
const generatePostBody = (movie, iframe = DEFAULT_IFRAME) => {
  let kind = 'blogger#post';
  let blog = {
    id: '999944992553436616',
  };
  //poster
  let posterImg = _.isEmpty(movie.posterImg)
    ? DEFAULT_POSTER
    : /defaultposter/.test(movie.posterImg)
    ? DEFAULT_POSTER
    : movie.posterImg;
  //labels
  let labels = _.isEmpty(movie.tags) ? [] : movie.tags;
  let year = _.isEmpty(movie.year) ? 'Đang cập nhật' : year;
  let country = _.isEmpty(movie.country) ? 'Đang cập nhật' : country;
  labels.push(year);
  labels.push(country);
  let title = movie.title;
  if (!_.isEmpty(title)) title = [movie.vnTitle, movie.enTitle].filter(Boolean).join(' - ');

  let description = _.isEmpty(movie.description) ? '' : description;
  let ifr = _.isEmpty(iframe) ? '' : iframe;
  //content
  let content = `<div class="separator" style="clear: both; display: none; text-align: center;"><a href="${DEFAULT_POSTER}" imageanchor="1" style="margin-left: 1em; margin-right: 1em;"><img alt="${title}" border="0" src="${DEFAULT_POSTER}" /></a></div><span style="font-size: large;">${title}</span><br /><br /><b>Thể loại</b>&nbsp; ${labels.join(
    ', '
  )}<br/><b>Quốc gia</b>&nbsp; ${country}<br/><b>Năm</b>&nbsp; ${year}<br/><br/>${description}<br/><br/>${ifr}`;

  return { kind, blog, title, content, labels };
};
const createPostPromise = (movie) => {
  // Download first
  return new Promise((resolve) => {
    const upload = async () => {
      let postBody = {};
      const headers = {
        Authorization: `Bearer ${BLOG_OAUTH_TOKEN}`,
      };
      let requestOptions = {
        method: 'POST',
        headers,
      };
      if (_.isEmpty(movie.doodstreamCode)) {
        postBody = generatePostBody(movie);
        requestOptions.body = JSON.stringify(postBody);
        console.log(movie.link);
        resolve(movie.id);
      } else {
        // get the embedded iframe from doodstream
        try {
          const file_code = movie.doodstreamCode;
          const doodstreamURI = DOODSTREAM_API_END_POINT.replace('REPLACE_CODE', file_code);
          const res = await fetch(doodstreamURI, { method: 'GET' });
          const response = await res.json();
          console.log(response);
          if (response.msg === 'OK' && response.status === 200) {
            let protected_embed = _.get(response, 'result')[0].protected_embed;
            if (_.isEmpty(protected_embed)) {
              protected_embed = '/e/nvxor1okzzs62sqg0j0r4iltkz7saxlp';
            }
            const iframe = `<iframe width="600" height="480" src="https://dood.la${protected_embed}" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>`;
            console.log(`https://dood.la${protected_embed}`);
            postBody = generatePostBody(movie, iframe);
            requestOptions.body = JSON.stringify(postBody);
          }
        } catch (e) {
          console.log(e);
        }
      }
      const check = await CoPhimFeatureMovie.findById(movie.id);
      if (!check.published) {
        // create post
        try {
          const res = await fetch(BLOGGER_API_END_POINT, requestOptions);
          const response = await res.json();
          if (!_.isEmpty(response.id)) {
            check.published = 1;
            await check.save();
            console.log('Created new post :', response.id);
          }
        } catch (e) {
          console.log(e);
        }
      }
      resolve(movie.id);
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
    $and: [{ published: { $ne: 1 } }],
  }).limit(30);
  let promises = [];
  let movies = [];
  first30Items.map((item) => {
    if (item.videoLinks && item.videoLinks.length) {
      const links = item.videoLinks;
      links.map((link) => {
        if (true) {
          const movie = {
            vnTitle: item.vnTitle,
            enTitle: item.enTitle,
            link: link.link,
            linkId: link.id,
            title: link.title,
            doodstreamCode: link.doodstreamCode,
            id: item.id,
            posterImg: item.posterImg,
            tags: item.tags,
            country: item.country,
            year: item.year,
            description: item.description,
          };
          movies.push(movie);
        }
      });
    }
  });
  promises = movies.map((item) => createPostPromise(item));
  Promise.all(promises)
    .then((results) => {
      console.log(results);
      process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      console.timeEnd('MAIN');
      process.exit(0);
    });
  return;
};

main();

// const job = new CronJob(
//   '0 */1 * * * *',
//   function () {
//     console.log('Every 1 minutes ----- Run job');
//     try {
//       main();
//     } catch (e) {
//       console.log(e);
//       process.exit(0);
//     }
//   },
//   null,
//   true,
//   'Asia/Ho_Chi_Minh'
// );
// job.start();
