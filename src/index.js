// import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';

const onChange = require('on-change');
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
    state: null, // Rss has been loaded, Must be valid url, Rss already exists
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

const watchedState = onChange(state, (path, value) => {
  console.log(path);
  console.log(value);
  console.log(state.form.state.url);
  const borderElement = document.querySelector('input');
  if (watchedState.form.state.valid === false) {
    borderElement.classList.add('is-invalid');
  }
  if (watchedState.form.state.valid === true) {
    borderElement.classList.remove('is-invalid');
    borderElement.value = '';
  }
  if (path === 'form.state.status') {
    console.log(value);
    console.log('Ooops!');
    const feedbackEl = document.querySelector('.feedback');
    feedbackEl.classList.add('text-danger');
  }
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

const form = document.querySelector('form');
// console.log(form);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = form.querySelector('input').value;
  if (isFeedExist(url)) {
    watchedState.form.state.valid = false;
    watchedState.form.state.status = 'Rss already exists';
  }
  if (!isFeedExist(url)) {
    // console.log('Oooops!');

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
              const parser = new DOMParser();
              const xmlDom = parser.parseFromString(data.contents, 'text/xml');

              console.log(xmlDom.querySelector('title').textContent);
              console.log(xmlDom.querySelector('description').textContent);
              console.log(xmlDom.querySelectorAll('title'));
              console.log(xmlDom);
              const feedName = xmlDom.querySelector('title').textContent;
              const feedDescription = xmlDom.querySelector('description').textContent;
              state.feeds.push({ name: feedName, description: feedDescription, url });
              console.log(state.feeds);
            });
        }
      });
  }
});
