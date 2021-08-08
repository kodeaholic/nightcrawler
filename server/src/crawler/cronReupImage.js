const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { GPhotos } = require('upload-gphotos');
const CronJob = require('cron').CronJob;
const gphotos = new GPhotos();
const request = require('request');
const _ = require('lodash');
const { CoPhimFeatureMovie } = require('../models');
let album;
const setup = async () => {
  try {
    await gphotos.signin({
      username: 'phimmoisieuhay@gmail.com',
      password: 'matkhau24031995',
    });

    console.log('Google Photos connected ...');
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
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

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
        download(fileUrl, filePath, async () => {
          console.log('✅ Dowloaded ', filePath);
          console.log('Start uploading to Google Photoes ...');
          try {
            gphotos
              .signin({
                username: 'phimmoisieuhay@gmail.com',
                password: 'matkhau24031995',
              })
              .then(() => {
                gphotos
                  .searchAlbum({ title: 'posters' })
                  .then(async (album) => {
                    gphotos
                      .upload({
                        stream: fs.createReadStream(filePath),
                        size: (await fs.promises.stat(filePath)).size,
                        filename: fileName,
                      })
                      .then(async (photo) => {
                        // succeeded
                        album
                          .append(photo)
                          .then(async () => {
                            const posterImg = photo.rawUrl;
                            console.log('Done uploaded into album ...', photo.rawUrl);
                            if (movieId && !_.isEmpty(photo.rawUrl)) {
                              const movie = await CoPhimFeatureMovie.findById(movieId);
                              Object.assign(movie, { posterImg: posterImg, posterReup: 1 });
                              await movie.save();
                              console.log('Done reup for movie ', movieId);
                              console.log(movie);
                            }
                            try {
                              fs.unlinkSync(filePath);
                              console.log('✅ Deleted ', filePath);
                            } catch (err) {
                              if (movieId) resolve(movieId);
                              else resolve(fileUrl);
                              console.error(err);
                            }
                            if (movieId) resolve(movieId);
                            else resolve(fileUrl);
                          })
                          .catch((error) => {
                            console.log(error);
                            if (movieId) resolve(movieId);
                            else resolve(fileUrl);
                          });
                      })
                      .catch((err) => {
                        console.log(err);
                        if (movieId) resolve(movieId);
                        else resolve(fileUrl);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    if (movieId) resolve(movieId);
                    else resolve(fileUrl);
                  });
              })
              .catch((error) => {
                console.log(error);
                if (movieId) resolve(movieId);
                else resolve(fileUrl);
              });
          } catch (e) {
            if (movieId) resolve(movieId);
            else resolve(fileUrl);
            console.log(e);
            if (movieId) console.log('Failed reup for movie ', movieId);
          }
        });
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
      resolve('EMPTY posterImg');
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
  if (!album) {
    await gphotos.signin({
      username: 'phimmoisieuhay@gmail.com',
      password: 'matkhau24031995',
    });
    album = await gphotos.searchAlbum({ title: 'posters' });
    console.log('Google Photos connected ...');
  }
  console.log('Getting 10 movies ...');
  const first10Items = await CoPhimFeatureMovie.find({ posterReup: { $ne: 1 }, posterImg: { $not: /defaultposter/ } }).limit(
    10
  );
  const promises = first10Items.map((movie) => uploadFilePromise(movie.posterImg, movie.id));
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
