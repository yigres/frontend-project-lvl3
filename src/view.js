const onChange = require('on-change');

const view = (state) => {
  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
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
      // ***********
      const postsUlEl = document.querySelector('.posts > ul');
      console.log(`!!!${state.posts.length}`);
      state.posts
        .filter(({ feedId }) => feedId === lastFeedIndex + 1)
        .reverse()
        .forEach((post) => {
          console.log(post.feedId);
          const postLiEl = document.createElement('li');
          postLiEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
          postLiEl.innerHTML = `<a href=${post.link}
            class="font-weight-normal"
            data-id="${post.feedId}${post.postId}"
            target="_blank"
            rel="noopener noreferrer"
            >
            ${post.name}
            </a>`;
          postsUlEl.prepend(postLiEl);
        });
    }
  });
  return watchedState;
};

export default view;
