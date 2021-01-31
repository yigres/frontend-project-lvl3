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

const viewPosts = (state) => {
  const lastFeedIndex = state.feeds.length - 1;
  const postsUlEl = document.querySelector('.posts > ul');
  state.posts
    .filter(({ feedId }) => feedId === lastFeedIndex + 1)
    .reverse()
    .forEach((post) => {
      const postLiEl = document.createElement('li');
      postLiEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const linkEl = document.createElement('a');
      linkEl.href = post.link;
      linkEl.classList.add('font-weight-normal');
      linkEl.target = '_blank';
      linkEl.dataset.id = post.postId;
      linkEl.rel = 'noopener noreferrer';
      linkEl.textContent = post.name;
      postLiEl.append(linkEl);
      postsUlEl.prepend(postLiEl);
    });
};

const viewNewPost = (state) => {
  const postsUlEl = document.querySelector('.posts > ul');
  const postLiEl = document.createElement('li');
  postLiEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  const { postId, name, link } = state.posts[0];
  const linkEl = document.createElement('a');
  linkEl.href = link;
  linkEl.classList.add('font-weight-normal');
  linkEl.target = '_blank';
  linkEl.dataset.id = postId;
  linkEl.rel = 'noopener noreferrer';
  linkEl.textContent = name;
  postLiEl.append(linkEl);
  postsUlEl.prepend(postLiEl);
};

const view = (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.state.status') {
      const borderElement = document.querySelector('input');
      if (watchedState.form.state.valid === false) {
        borderElement.classList.add('is-invalid');
      }
      if (watchedState.form.state.valid === true) {
        borderElement.classList.remove('is-invalid');
        borderElement.value = '';
      }
      const feedbackEl = document.querySelector('.feedback');
      if (value === 'Rss has been loaded') {
        feedbackEl.classList.remove('text-danger');
        feedbackEl.classList.add('text-success');
      }
      if (value !== 'Rss has been loaded') {
        feedbackEl.classList.add('text-danger');
      }
      feedbackEl.textContent = value;
    }
    if (path === 'feeds') {
      viewFeeds(state);
      viewPosts(state);
    }
    if (path === 'posts') {
      viewNewPost(state);
    }
  });
  return watchedState;
};

export default view;
