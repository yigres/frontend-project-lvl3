/* eslint no-param-reassign:
    ["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */
const onChange = require('on-change');

const viewFeeds = (state) => {
  if (state.feeds.length === 1) {
    const feedsEl = document.querySelector('.feeds');
    feedsEl.innerHTML = '<h2>Feeds</h2><ul class="list-group mb-5"></ul>';
    const postsEl = document.querySelector('.posts');
    postsEl.innerHTML = '<h2>Posts</h2><ul class="list-group"></ul>';
  }

  const feedsUlEl = document.querySelector('.feeds > ul');
  const lastFeedIndex = state.feeds.length - 1;
  const feedLiEl = document.createElement('li');
  feedLiEl.classList.add('list-group-item');
  feedLiEl.innerHTML = `<h3>${state.feeds[lastFeedIndex].name}</h3>
    <p>${state.feeds[lastFeedIndex].description}</p>`;
  feedsUlEl.prepend(feedLiEl);
};

const viewPosts = (state, watchedState) => {
  const lastFeedIndex = state.feeds.length - 1;
  const postsUlEl = document.querySelector('.posts > ul');
  state.posts
    .filter(({ feedId }) => feedId === lastFeedIndex + 1)
    .forEach((post) => {
      const postLiEl = document.createElement('li');
      postLiEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const linkEl = document.createElement('a');
      linkEl.href = post.link;
      linkEl.classList.add('fw-bold');
      linkEl.target = '_blank';
      linkEl.dataset.id = post.postId;
      linkEl.rel = 'noopener noreferrer';
      linkEl.textContent = post.name;
      postLiEl.append(linkEl);
      const previewButton = document.createElement('button');
      previewButton.type = 'button';
      previewButton.ariaLabel = 'preview';
      previewButton.classList.add('btn', 'btn-primary');
      previewButton.dataset.id = post.postId;
      previewButton.dataset.bsToggle = 'modal';
      previewButton.dataset.bsTarget = '#previewModal';
      previewButton.textContent = 'Preview';
      postLiEl.append(previewButton);
      postsUlEl.prepend(postLiEl);

      linkEl.addEventListener('click', () => {
        watchedState.posts[post.postId - 1].unread = false;
      });
    });
};

const viewNewPost = (state, watchedState) => {
  const postsUlEl = document.querySelector('.posts > ul');
  const postLiEl = document.createElement('li');
  postLiEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  const { postId, name, link } = state.posts[state.posts.length - 1];
  const linkEl = document.createElement('a');
  linkEl.href = link;
  linkEl.classList.add('fw-bold');
  linkEl.target = '_blank';
  linkEl.dataset.id = postId;
  linkEl.rel = 'noopener noreferrer';
  linkEl.textContent = name;
  postLiEl.append(linkEl);
  const previewButton = document.createElement('button');
  previewButton.type = 'button';
  previewButton.classList.add('btn', 'btn-primary');
  previewButton.dataset.id = postId;
  previewButton.dataset.bsToggle = 'modal';
  previewButton.dataset.bsTarget = '#previewModal';
  previewButton.textContent = 'Preview';
  postLiEl.append(previewButton);
  postsUlEl.prepend(postLiEl);

  linkEl.addEventListener('click', () => {
    watchedState.posts[postId - 1].unread = false;
  });
};

const view = (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.state.status') {
      const submit = document.querySelector('button[type=submit]');
      const borderElement = document.querySelector('input');
      const feedbackEl = document.querySelector('.feedback');

      if (value === 'loading...') {
        submit.disabled = true;
      } else {
        submit.disabled = false;
      }

      if (state.form.state.valid === false) {
        borderElement.classList.add('is-invalid');
      }
      if (state.form.state.valid === true) {
        borderElement.classList.remove('is-invalid');
      }

      if (value === 'Rss has been loaded') {
        const form = document.querySelector('form');

        form.querySelector('input').value = '';
        feedbackEl.classList.remove('text-danger');
        feedbackEl.classList.add('text-success');
      }

      if (value !== 'Rss has been loaded') {
        feedbackEl.classList.add('text-danger');
      }
      feedbackEl.textContent = value;
      console.log(`value(view)=${value}`);
      console.log(`feedbackEl.textContent=${feedbackEl.textContent}`);
    }
    if (path === 'feeds') {
      viewFeeds(state);
      viewPosts(state, watchedState);
    }
    if (path === 'posts') {
      viewNewPost(state, watchedState);
    }
    if (path.slice(-6) === 'unread') {
      const beginPos = 5;
      const endPos = path.indexOf('.', 6);
      const idValue = Number(path.slice(beginPos + 1, endPos)) + 1;
      const aEl = document.querySelector(`a[data-id='${idValue}']`);
      aEl.classList.remove('fw-bold');
      aEl.classList.add('fw-normal');
    }
  });
  return watchedState;
};

export default view;
