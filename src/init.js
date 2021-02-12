import i18n from 'i18next';
import * as yup from 'yup';
import 'isomorphic-fetch';

import { initialState, i18nOptions } from './constants';
import createWatchedState from './state.js';
import {
  RssError,
  parseResponse,
  handleResponse,
} from './utils';

const feedExists = (url, state) => state.feeds.find((feed) => feed.url === url) || false;

const updateFeeds = (state) => {
  const { form, feeds } = state;
  const { state: formState } = form;
  feeds.forEach(({ url }) => {
    fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
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
        formState.status = status;
      })
      .catch((error) => {
        formState.status = error.message;
      });
  });
};

const init = () => {
  const state = createWatchedState(initialState);
  const { state: formState } = state.form;

  const schema = yup.object().shape({
    website: yup.string().url(),
  });

  const form = document.querySelector('form');
  const modalEl = document.getElementById('previewModal');

  const onFormSubmit = (event) => {
    event.preventDefault();

    const url = form.querySelector('input').value;
    formState.url = url;

    schema.isValid({ website: url }).then((valid) => {
      if (!valid) {
        formState.status = 'invalidUrl';
      } else if (feedExists(url, state)) {
        formState.status = 'duplicatedUrl';
      } else {
        formState.status = 'loading';
        fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then(parseResponse)
          .then(handleResponse)
          .then(({ feed, posts, status }) => {
            if (feed && typeof feed === 'object' && Array.isArray(posts)) {
              state.feeds.push({ ...feed, url });
              state.posts.push(...posts);
            }
            formState.status = status;
          })
          .catch((error) => {
            if (error instanceof RssError) {
              formState.status = error.message;
            } else {
              console.log(error);
              formState.status = 'commonError';
            }
          });
      }
    }).catch((error) => {
      formState.status = error.message;
    });
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

  return i18n.init(i18nOptions).then(() => {
    form.addEventListener('submit', onFormSubmit);
    modalEl.addEventListener('show.bs.modal', onModalShow);
    const tick = () => {
      updateFeeds(state);
      setTimeout(tick, 5000);
    };
    tick();
  }).catch(() => {
    formState.status = 'i18nextError';
  });
};

export default init;
