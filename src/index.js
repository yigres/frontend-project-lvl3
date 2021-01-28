// import 'bootstrap';
import i18n from 'i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
// import _ from 'lodash';
import view from './view.js';

// const axios = require('axios');

const state = {
  form: {
    state: {
      valid: null,
      url: null,
      status: null,
    },
  },
  feeds: [],
  posts: [],
};

const FeedExists = (value) => {
  let result = false;
  state.feeds.forEach(({ url }) => {
    if (url === value) {
      result = true;
    }
  });

  return result;
};

const watchedState = view(state);

const parser = (data, url, oldFeeds, oldPosts) => {
  const clonedArray = (arr) => JSON.parse(JSON.stringify(arr));

  const feeds = clonedArray(oldFeeds);
  const posts = clonedArray(oldPosts);
  const dom = new DOMParser();
  const doc = dom.parseFromString(data.contents, 'text/xml');
  const feedName = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const feedId = oldFeeds.length + 1;
  const items = doc.querySelectorAll('item');
  let postId = 1;

  items.forEach((item) => {
    const name = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({
      postId,
      feedId,
      name,
      link,
    });
    postId += 1;
  });
  console.log(state.posts);

  feeds.push({
    feedId,
    name: feedName,
    description: feedDescription,
    url,
  });

  return { feeds, posts };
};

const schema = yup.object().shape({
  website: yup.string().url(),
});

const form = document.querySelector('form');

i18n.init({
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {
        form: {
          status: {
            loaded: 'Rss has been loaded',
            invalid: 'Must be valid url',
            duplicated: 'Rss already exists',
          },
        },
      },
    },
  },
})
  .then(() => {
    form.addEventListener('submit', (e) => {
      const url = form.querySelector('input').value;
      e.preventDefault();
      if (FeedExists(url)) {
        watchedState.form.state.valid = false;
        watchedState.form.state.status = i18n.t('form.status.duplicated');
      }
      if (!FeedExists(url)) {
        schema
          .isValid({
            website: url,
          })
          .then((valid) => {
            state.form.state.url = url;
            if (valid === false) {
              watchedState.form.state.valid = false;
              watchedState.form.state.status = i18n.t('form.status.invalid');
            }
            if (valid === true) {
              form.querySelector('input').value = '';
              watchedState.form.state.valid = true;
              fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`)
                .then((response) => {
                  if (response.ok) {
                    watchedState.form.state.status = i18n.t('form.status.loaded');
                    return response.json();
                  }
                  throw new Error('Network response was not ok.');
                })
                .then((data) => {
                  const { feeds, posts } = parser(data, url, state.feeds, state.posts);
                  state.posts = posts;
                  watchedState.feeds = feeds;
                })
                .catch((er) => {
                  console.error('Something went wrong with response');
                  console.error(er);
                });
            }
          })
          .catch((error) => {
            console.error('Something went wrong url validation');
            console.error(error);
          });
      }
    });
  })
  .catch((e) => {
    console.error('Something went wrong with i18next initialization');
    console.error(e);
  });

export default state;
