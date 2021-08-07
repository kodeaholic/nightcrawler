const CronJob = require('cron').CronJob;
const { crawl20FeatureMovies, setup } = require('./cophimfeaturemovie');
const job = new CronJob(
  '0 */1 * * * *',
  function () {
    console.log('Every 1 minutes ----- Run job');
    crawl20FeatureMovies();
  },
  null,
  true,
  'Asia/Ho_Chi_Minh'
);
console.log('DB connecting ...');
setup();
console.log('DB connected ...');
job.start();
