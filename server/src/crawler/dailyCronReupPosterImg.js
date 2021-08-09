const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;
const request = require('request');
const _ = require('lodash');
const { CoPhimFeatureMovie } = require('../models');

const download = async (url, path, callback) => {
  const encodedURI = encodeURI(url);
  console.log('...Getting ', encodedURI);
  try {
    request.head(encodedURI, (err, res, body) => {
      if (res) console.log('content-type:', res.headers['content-type']);
      if (res) console.log('content-length:', res.headers['content-length']);
      request(encodedURI).pipe(fs.createWriteStream(path)).on('close', callback);
    });
  } catch (e) {
    console.log(url, path);
  }
};

const uploadFilePromise = (fileUrl, movieId = undefined) => {
  // Download first
  return new Promise((resolve) => {
    if (!_.isEmpty(fileUrl)) {
      const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      const filePath = path.join(__dirname, '/images/' + fileName);
      try {
        const upload = async () => {
          download(fileUrl, filePath, async () => {
            console.log('✅ Dowloaded ', filePath);
            console.log('Start uploading to get upload token ...');
            // Start upload to get uploadToken
            const accessToken =
              'ya29.a0ARrdaM-izEtT6e3n3dCQynYD0d1xe6EiWfYwXpstC4kJEijmjr8wofIIhIO2dEVvUzlQWNiWPf_MipojIlddld8RPNor-SjI8KM8wRVsxGY1g7nVkJPACgm6WhzzkKz-L1IUMRpPOozLnQpHeueKhS7s0pdC';
            let API_END_POINT = 'https://photoslibrary.googleapis.com/v1/uploads';
            let headers = {
              Authorization: `Bearer ${accessToken}`,
              'Content-type': 'application/octet-stream',
              //   'X-Goog-Upload-Content-Type': 'mime-type',
              'X-Goog-Upload-Protocol': 'raw',
            };
            const file = fs.createReadStream(filePath);
            let requestOptions = {
              method: 'POST',
              headers,
              body: file,
            };
            let res = await fetch(API_END_POINT, requestOptions);
            //   let data = await res.json();
            let uploadToken = await res.text();
            console.log('Uploading file using uploadToken');
            const albumId = 'AO-_jwvHHyn7_mUE9SqVt462E-ENcPhcBKtj1WJ8lXGGcbjFXWUfXy8';
            API_END_POINT = 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate';
            headers = {
              Authorization: `Bearer ${accessToken}`,
              'Content-type': 'application/json',
            };
            const body = {
              albumId,
              newMediaItems: {
                description: fileName,
                simpleMediaItem: {
                  fileName,
                  uploadToken,
                },
              },
            };
            requestOptions = {
              method: 'POST',
              headers,
              body: JSON.stringify(body),
            };
            res = await fetch(API_END_POINT, requestOptions);
            let response = await res.json();
            if (response.newMediaItemResults) {
              const result = response.newMediaItemResults[0];
              const mediaItem = result.mediaItem;
              API_END_POINT = `https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItem.id}`;
              requestOptions = {
                method: 'GET',
                headers,
              };
              res = await fetch(API_END_POINT, requestOptions);
              response = await res.json();
              if (response.baseUrl) {
                const movie = await CoPhimFeatureMovie.findById(movieId);
                Object.assign(movie, { posterImg: response.baseUrl, posterReup: 1 });
                await movie.save();
                console.log('Done reup for movie ', movieId);
              }
              try {
                fs.unlinkSync(filePath);
                console.log('✅ Deleted ', filePath);
              } catch (err) {
                if (movieId) resolve(movieId);
                else resolve(fileUrl);
                console.error(err);
              }
            }
            // get media item id => get public URL => save to DB
            resolve(movieId);
          });
        };
        upload();
      } catch (e) {
        if (movieId) resolve(movieId);
        else resolve(fileUrl);
        console.log(e);
        console.log('FileUrl: ', fileUrl);
        console.log('MovieId: ', movieId);
      }
    } else {
      CoPhimFeatureMovie.findById(movieId).then((movie) => {
        Object.assign(movie, {
          posterImg:
            'https://2.bp.blogspot.com/-Zc0xnr6YUXI/YQ-fB-q-8AI/AAAAAAAAEUc/athnl-bAYZwypsQNW9bWIfWffxjjHOxZwCLcBGAsYHQ/s0/defaultposter.jpg',
          posterReup: 1,
        });
        movie.save().then((movie) => {
          console.log('Update default poster: ', movie);
        });
      });
      resolve(movieId);
    }
  });
};

const main = async () => {
  process.setMaxListeners(0);
  console.time('MAIN');
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

  console.log('Getting 20 movies ...');
  const first20Items = await CoPhimFeatureMovie.find({ posterReup: { $ne: 1 }, posterImg: { $not: /defaultposter/ } }).limit(
    20
  );
  const promises = first20Items.map((movie) => uploadFilePromise(movie.posterImg, movie.id));
  Promise.all([promises])
    .then((results) => {
      console.log(results);
      console.timeEnd('MAIN');
      //process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      console.timeEnd('MAIN');
      //process.exit(0);
    });
  return;
};

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
