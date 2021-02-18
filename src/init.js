import * as yup from 'yup';
import 'isomorphic-fetch';
import 'bootstrap';

import { proxyUrl, i18nOptions } from './constants';
import createWatchedState from './state.js';
import { initI18n, parseResponse, handleResponse } from './utils';

const init = (options = {}) => {
  const initialState = {
    url: null,
    status: null,
    feeds: [],
    posts: [],
  };

  const { language = 'ru', update = false } = options;

  const state = createWatchedState(initialState);

  const schema = yup.object().shape({
    website: yup.string().url(),
  });

  const formEl = document.querySelector('form');
  const modalEl = document.querySelector('#previewModal');
  const handleResponseError = (error) => {
    if (error instanceof Error && /reason: no internet/.test(error.message)) {
      state.status = 'networkError';
    } else if (['responseError', 'parseError'].includes(error.message)) {
      state.status = error.message;
    } else {
      state.status = 'commonError';
    }
  };

  const feedExists = (url) => state.feeds.find((feed) => feed.url === url) || false;

  const updateFeeds = () => {
    state.feeds.forEach(({ url }) => {
      fetch(`${proxyUrl}/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then(parseResponse)
        .then(handleResponse)
        .then(({ feed, posts, status }) => {
          if (feed && typeof feed === 'object' && Array.isArray(posts)) {
            const { posts: existingPosts } = state;
            posts.forEach((post) => {
              if (!existingPosts.find((existingPost) => existingPost.id === post.id)) {
                existingPosts.push(post);
              }
            });
          }
          state.status = status;
        })
        .catch(handleResponseError);
    });
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    const url = formEl.querySelector('input').value;
    state.url = url;

    const valid = schema.isValidSync({ website: url });
    if (!valid) {
      state.status = 'invalidUrl';
    } else if (feedExists(url)) {
      state.status = 'duplicatedUrl';
    } else {
      state.status = 'loading';
      fetch(`${proxyUrl}/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then(parseResponse)
        .then(handleResponse)
        .then(({ feed, posts, status }) => {
          if (feed && typeof feed === 'object' && Array.isArray(posts)) {
            state.feeds.push({ ...feed, url });
            state.posts.push(...posts);
          }
          state.status = status;
        })
        .catch(handleResponseError);
    }
  };

  const onModalShow = (event) => {
    const { id } = event.relatedTarget.dataset;
    const post = state.posts.find((item) => item.id === id);
    post.unread = false;
    const { name, description, link } = post;
    const modal = event.target;
    modal.querySelector('.modal-title').textContent = name;
    modal.querySelector('.modal-body').textContent = description;
    modal.querySelector('div a').href = link;
  };

  formEl.addEventListener('submit', onFormSubmit);
  modalEl.addEventListener('show.bs.modal', onModalShow);

  return initI18n({ ...i18nOptions, lng: language }).then(() => {
    if (update) {
      const tick = () => {
        updateFeeds();
        setTimeout(tick, 5000);
      };
      tick();
    }
  }).catch(() => {
    state.status = 'i18nextError';
  });
};

export default init;
