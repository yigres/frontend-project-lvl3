// import 'bootstrap';
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
  rss: {
    state: null, // Rss has been loaded / Must be valid url / Rss already exists
  },
  feeds: [],
  posts: [],
};

const isFeedExist = (value) => {
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
  const feeds = JSON.parse(JSON.stringify(oldFeeds));
  const posts = JSON.parse(JSON.stringify(oldPosts));
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

form.addEventListener('submit', (e) => {
  const url = form.querySelector('input').value;
  e.preventDefault();
  if (isFeedExist(url)) {
    watchedState.form.state.valid = false;
    watchedState.form.state.status = 'Rss already exists';
  }
  if (!isFeedExist(url)) {
    schema
      .isValid({
        website: url,
      })
      .then((valid) => {
        state.form.state.url = url;
        if (valid === false) {
          watchedState.form.state.valid = false;
          watchedState.form.state.status = 'Must be valid url';
        }
        if (valid === true) {
          form.querySelector('input').value = '';
          watchedState.form.state.valid = true;
          fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`)
            .then((response) => {
              if (response.ok) {
                watchedState.form.state.status = 'Rss has been loaded';
                return response.json();
              }
              throw new Error('Network response was not ok.');
            })
            .then((data) => {
              const { feeds, posts } = parser(data, url, state.feeds, state.posts);
              state.posts = posts;
              watchedState.feeds = feeds;
            });
        }
      });
  }
});

export default state;
