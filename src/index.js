import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';

import i18n from 'i18next';
import * as yup from 'yup';

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
  let postId = oldPosts.length + 1;

  items.forEach((item) => {
    const name = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({
      postId,
      feedId,
      name,
      description,
      link,
      unread: true,
    });
    postId += 1;
  });

  feeds.push({
    feedId,
    name: feedName,
    description: feedDescription,
    url,
  });

  return { feeds, posts };
};
// ***************
const checkFeeds = (timerId) => {
  console.log(timerId);
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
        const newPosts = posts.map((newPost) => ({ name: newPost.name, link: newPost.link }));
        const oldPostUrls = state.posts
          .filter((postValue) => postValue.feedId === feed.feedId)
          .map((postValue) => postValue.link);
        newPosts.forEach((newPost) => {
          if (oldPostUrls.indexOf(newPost.link) === (-1)) {
            const postId = state.posts.length + 1;
            watchedState.posts.unshift({
              postId,
              feedId: feed.feedId,
              name: newPost.name,
              link: newPost.link,
            });
            // console.log(state.posts);
          }
        });
      })
      .catch((er) => {
        console.error('Something went wrong with response');
        console.error(er);
      });
  });
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
              fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
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
                  // console.log(state.posts);
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

    const modalEl = document.getElementById('previewModal');

    modalEl.addEventListener('show.bs.modal', (event) => {
      console.log(event);
      const { id } = event.relatedTarget.dataset;
      // console.log(id, event.relatedTarget);
      const { name, description } = state.posts[id - 1];
      // console.log(name);
      const modal = event.target;
      modal.querySelector('.modal-title').textContent = name;
      modal.querySelector('.modal-body').textContent = description;
    });

    let timerId = setTimeout(function tick() {
      timerId = setTimeout(tick, 5000);
      checkFeeds(timerId);
    }, 5000);
  })
  .catch((e) => {
    console.error('Something went wrong with i18next initialization');
    console.error(e);
  });

export default state;
