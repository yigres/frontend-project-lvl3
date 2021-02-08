/* eslint no-param-reassign:
    ["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */

import i18n from 'i18next';
import * as yup from 'yup';
import 'isomorphic-fetch';

import view from './view.js';

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

const feedExists = (value) => {
  let result = false;
  state.feeds.forEach(({ url }) => {
    if (url === value) {
      result = true;
    }
  });

  return result;
};

// ***************
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

  for (let i = 1; i <= items.length; i += 1) {
    const item = items[items.length - i];
    const name = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({
      postId: oldPosts.length + i,
      feedId,
      name,
      description,
      link,
      unread: true,
    });
  }

  feeds.push({
    feedId,
    name: feedName,
    description: feedDescription,
    url,
  });

  return { feeds, posts };
};
// ***************
const checkFeeds = (watchedState) => {
  state.feeds.forEach((feed) => {
    fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then((data) => {
        const { posts } = parser(data, feed.url, [], []);
        const newPosts = posts.map((newPost) => ({
          name: newPost.name,
          description: newPost.description,
          link: newPost.link,
        }));
        const oldPostUrls = state.posts
          .filter((postValue) => postValue.feedId === feed.feedId)
          .map((postValue) => postValue.link);
        newPosts.forEach((newPost) => {
          if (oldPostUrls.indexOf(newPost.link) === (-1)) {
            const postId = state.posts.length + 1;
            watchedState.posts.push({
              postId,
              feedId: feed.feedId,
              name: newPost.name,
              description: newPost.description,
              link: newPost.link,
              unread: true,
            });
          }
        });
      })
      .catch(() => {
        watchedState.form.state.status = i18n.t('form.status.networkError');
      });
  });
};

export default () => {
  const watchedState = view(state);

  const schema = yup.object().shape({
    website: yup.string().url(),
  });
  console.log(schema);

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
              networkError: 'Network error or bad url',
              validationError: 'Validation error',
              i18nextError: 'Something went wrong with i18next initialization',
              loading: 'loading...',
            },
          },
        },
      },
    },
  })
    .then(() => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = form.querySelector('input').value;
        state.form.state.url = url;

        const urlEl = document.querySelector('.url');
        urlEl.textContent = url;
        console.log(`url=${url}`);

        const feedExistsEl = document.querySelector('.feedExists');
        feedExistsEl.textContent = feedExists(url);
        console.log(`feedExists=${feedExistsEl.textContent}`);

        const schemaEl = document.querySelector('.schema');
        schema.isValid({
          website: url,
        }).then((valid) => { schemaEl.textContent = valid; });

        schema.isValid({
          website: url,
        }).then((valid) => { console.log(`valid=${valid}`); });
        schema
          .isValid({
            website: url,
          })
          .then((valid) => {
            const validEl = document.querySelector('.valid');
            validEl.textContent = valid;
            console.log(`valid=${valid}`);

            if (valid === false) {
              state.form.state.valid = false;
              watchedState.form.state.status = i18n.t('form.status.invalid');
            }
            if (valid === true) {
              if (feedExists(url)) {
                watchedState.form.state.valid = false;
                watchedState.form.state.status = i18n.t('form.status.duplicated');
              }
              if (!feedExists(url)) {
                state.form.state.valid = true;
                watchedState.form.state.status = i18n.t('form.status.loading');
                fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
                  .then((response) => {
                    const responseEl = document.querySelector('.response');
                    responseEl.textContent = response.ok;
                    console.log(`responseOk=${responseEl.textContent}`);

                    if (response.ok) {
                      watchedState.form.state.status = i18n.t('form.status.loaded');
                      return response.json();
                    }

                    throw new Error('Network response was not ok.');
                  })
                  .then((data) => {
                    const dataEl = document.querySelector('.data');
                    dataEl.textContent = data;
                    console.log(`data=${data}`);

                    const { feeds, posts } = parser(data, url, state.feeds, state.posts);
                    state.posts = posts;
                    watchedState.feeds = feeds;
                  })
                  .catch((error) => {
                    const catchEl = document.querySelector('.catch');
                    catchEl.textContent = error.message;
                    watchedState.form.state.status = i18n.t('form.status.networkError');
                  });
              }
            }
          })
          .catch((error) => {
            const catchEl = document.querySelector('.catch');
            catchEl.textContent = error.message;
            // watchedState.form.state.status = i18n.t('form.status.validationError');
            const feedback = document.querySelector('.feedback');
            feedback.textContent = error.message;
            console.log(feedback);
          });
      });

      const modalEl = document.getElementById('previewModal');

      modalEl.addEventListener('show.bs.modal', (event) => {
        const { id } = event.relatedTarget.dataset;
        const {
          name,
          description,
          link,
        } = state.posts[id - 1];
        const modal = event.target;
        modal.querySelector('.modal-title').textContent = name;
        modal.querySelector('.modal-body').textContent = description;
        modal.querySelector('div a').href = link;
        watchedState.posts[id - 1].unread = false;
      });

      setTimeout(function tick() {
        setTimeout(tick, 5000);
        checkFeeds(watchedState);
      }, 5000);
    })
    .catch(() => {
      watchedState.form.state.status = i18n.t('form.status.i18nextError');
    });
};
