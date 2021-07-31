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

const MovieSchema = mongoose.Schema(
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
const Movie = mongoose.model('Movie', MovieSchema);
const FailedMovieSchema = mongoose.Schema(
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
const FailedMovie = mongoose.model('FailedMovie', FailedMovieSchema);
const getLinksAndThumbnails = async (item) => {
  const homeOrigin = `http://cophim.com/danh-sach/phim-le/page/${item}/`;
  const links = [];
  const movies = [];
  console.log(`Fetching ${homeOrigin} ...`);
  let res = await fetch(homeOrigin);
  if (res.status === 200) {
    res = await res.text();
    const node = xpath.fromPageSource(res).findElements("//a[contains(@class, 'film-small')]");
    const thumbs = xpath.fromPageSource(res).findElements("//div[contains(@class, 'poster-film-small')]");
    if (node && node.length) {
      node.forEach((child, index) => {
        const href = child.getAttribute('href');
        const style = index < thumbs.length ? thumbs[index].getAttribute('style') : '';
        thumb = style.match(/\((.*?)\)/)[1].replace(/('|")/g, '');
        if (!links.includes(href)) {
          links.push(href);
          movies.push({ url: href, thumb });
        }
      });
    }
  } else {
    console.log(`Fetch failed. Check ${homeOrigin}`);
  }
  return movies;
};

const getDownloadLinksAndSubtitles = async (id) => {
  const form = new FormData();
  form.append('action', 'apiFilmAjaxPagi');
  form.append('postID', id);
  const response = await fetch('http://cophim.com/wp-admin/admin-ajax.php', { method: 'POST', body: form });
  const data = await response.json();

  return { ...data, id };
};

const getMovieDetails = async (movie) => {
  const origin = movie.url;
  console.log(`Fetching ${origin} ...`);
  let year;
  let country;
  let vnTitle;
  let enTitle;
  let watch = [];
  let description;
  const group = 'Phim lẻ chọn lọc';
  let tags = [];
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
      description = doc.findElement("//div[contains(@class, 'text-des')]");
      if (_.isEmpty(description)) {
        description = doc.findElement("//p[contains(@class, 'content-film')]");
        description = _.isEmpty(description) ? 'NA' : description.getText();
      } else description = description.getText();
      enTitle = doc.findElement("//h2[contains(@class, 'title-film-detail-2')]");
      // enTitle = enTitle ? enTitle.getText() : 'NA';
      if (_.isEmpty(enTitle)) {
        enTitle = doc.findElement("//p[contains(@class, 'text-sub')]");
        enTitle = _.isEmpty(enTitle) ? 'NA' : enTitle.getText();
      } else enTitle = enTitle.getText();
    } catch (e) {
      console.log(origin);
      console.log(e);
    }

    // get download links & subtitles
    watch = [];
    const watchUrl = origin.replace('cophim.com', 'cophim.com/phim');
    res = await fetch(watchUrl);
    console.log(`Fetching ${watchUrl} ...`);
    let manual = false;
    let links = [];
    if (res.status === 200) {
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
      console.log('Saving into mongodb... ');
      try {
        console.log(description);
        const mv = await Movie.create({
          year,
          country,
          vnTitle,
          enTitle,
          watch,
          group,
          tags,
          description,
          url: movie.url,
          thumb: movie.thumb,
        });
        console.log(mv);
        console.log('Saved!');
      } catch (e) {
        console.log(e);
        console.log('Saving failed');
      }
      return { year, country, vnTitle, enTitle, watch, group, tags, description };
    }
    console.log(`Fetch failed. Check ${watchUrl}`);
    return {};
  }
  console.log(`Fetch failed. Check ${origin}`);
  return {};
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} array to split
 * @param chunkSize {Integer} Size of every group
 */
function chunkArray(myArray, chunkSize) {
  let index = 0;
  const arrayLength = myArray.length;
  const tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    myChunk = myArray.slice(index, index + chunkSize);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

const crawl = async () => {
  const array = Array(185)
    .fill()
    .map((x, index) => index + 1);
  let movies = [];
  const chunkedArray = chunkArray(array, 30);
  const m = chunkedArray.length;
  for (i = 0; i < m; i += 1) {
    const loop = chunkedArray[i].length;
    for (j = 0; j < loop; j += 1) {
      const items = await getLinksAndThumbnails(chunkedArray[i][j]);
      console.log(`Done crawling first level for page ${chunkedArray[i][j]}`);
      console.log('Sleeping 5s ...');
      await sleep(10000);
      console.log(`Getting details for ${items.length} movies on page ${chunkedArray[i][j]}...`);
      const size = items.length;
      const chunkedMoviesList = Array(size)
        .fill()
        .map((x, index) => index + 1); // [1..size]
      movies = movies.concat(items);
      await Promise.all(
        chunkedMoviesList.map(async (item, index) => {
          try {
            await getMovieDetails(items[index]);
          } catch (e) {
            await FailedMovie.create({ link: items[index].url });
          }
        })
      );
      console.log('Done. Sleeping 1.5 mins ...');
      await sleep(200000);
    }
    console.log('Sleeping in 30s');
    await sleep(30000);
  }
  process.exit(0);
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
};
setup();
crawl();
