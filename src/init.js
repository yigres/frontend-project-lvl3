/* eslint no-param-reassign:
    ["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */

import i18n from 'i18next';
import * as yup from 'yup';
import 'isomorphic-fetch';

import view from './view.js';

const feedExists = (value, state) => {
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
const checkFeeds = (watchedState, state) => {
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
  const state = {
    form: {
      state: {
        url: null,
        status: null,
      },
    },
    feeds: [],
    posts: [],
  };
  const watchedState = view(state);
  const form = document.querySelector('form');
  const schema = yup.object().shape({
    website: yup.string().url(),
  });

  i18n.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          form: {
            status: {
              rssLoaded: 'Rss has been loaded',
              invalidUrl: 'Must be valid url',
              duplicatedUrl: 'Rss already exists',
              networkError: 'Network error or bad url',
              validationError: 'Validation error',
              i18nextError: 'Something went wrong with i18next initialization',
              badResponse: 'Network response was not ok',
              // statusNotExists: 'Status is not found in http response',
              // contentTypeNotExists: 'Content type is not found in http response',
              nonRss: 'This source doesn\'t contain valid rss',
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

        console.log(`url=${url}`);

        schema
          .isValid({
            website: url,
          })
          .then((valid) => {
            console.log(`valid=${valid}`);

            if (!valid) {
              watchedState.form.state.status = i18n.t('form.status.invalidUrl');
            } else if (feedExists(url, state)) {
              watchedState.form.state.status = i18n.t('form.status.duplicatedUrl');
            } else {
              watchedState.form.state.status = i18n.t('form.status.loading');
              fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
                .then((response) => {
                  if (response.ok) {
                    return response.json();
                  }

                  throw new Error(i18n.t('form.status.badResponse'));
                })
                .then((data) => {
                  console.log(data);

                  const { contents } = data;
                  if (!contents || typeof contents !== 'string') {
                    throw new Error(i18n.t('form.status.nonRss'));
                  }
                  if (contents.indexOf('rss ') === (-1)) {
                    throw new Error(i18n.t('form.status.nonRss'));
                  } else {
                    const { feeds, posts } = parser(data, url, state.feeds, state.posts);
                    state.posts = posts;
                    watchedState.feeds = feeds;
                    watchedState.form.state.status = i18n.t('form.status.rssLoaded');
                  }
                })
                .catch((error) => {
                  watchedState.form.state.status = error.message;
                });
            }
          })
          .catch((error) => {
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
        checkFeeds(watchedState, state);
      }, 5000);
    })
    .catch(() => {
      watchedState.form.state.status = i18n.t('form.status.i18nextError');
    });
};
