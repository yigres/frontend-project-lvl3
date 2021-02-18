import i18n from 'i18next';

export const getRenderedFeedsCount = () => document.querySelectorAll('.feeds > ul > li').length;
export const getRenderedPostsCount = () => document.querySelectorAll('.posts > ul > li').length;

export const renderFeedsHeader = () => {
  const feedsEl = document.querySelector('.feeds');
  feedsEl.innerHTML = `<h2>${i18n.t('feeds')}</h2><ul class="list-group mb-5"></ul>`;
};

export const renderPostsHeader = () => {
  const postsEl = document.querySelector('.posts');
  postsEl.innerHTML = `<h2>${i18n.t('posts')}</h2><ul class="list-group"></ul>`;
};

export const renderNewFeed = (feed) => {
  const feedsUlEl = document.querySelector('.feeds > ul');
  const feedLiEl = document.createElement('li');
  feedLiEl.classList.add('list-group-item');
  feedLiEl.innerHTML = `<h3>${feed.name}</h3>
    <p>${feed.description}</p>`;
  feedsUlEl.prepend(feedLiEl);
};

export const renderNewPost = (post, clickHandler) => {
  const { id, name, link } = post;
  const postsUlEl = document.querySelector('.posts > ul');
  const postLiEl = document.createElement('li');
  postLiEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  const linkEl = document.createElement('a');
  linkEl.href = link;
  linkEl.classList.add('font-weight-bold', 'fw-bold');
  linkEl.target = '_blank';
  linkEl.dataset.id = id;
  linkEl.rel = 'noopener noreferrer';
  linkEl.textContent = name;
  postLiEl.append(linkEl);
  const previewButton = document.createElement('button');
  previewButton.type = 'button';
  previewButton.classList.add('btn', 'btn-primary');
  previewButton.dataset.id = id;
  previewButton.dataset.bsToggle = 'modal';
  previewButton.dataset.bsTarget = '#previewModal';
  previewButton.textContent = i18n.t('preview');
  postLiEl.append(previewButton);
  postsUlEl.prepend(postLiEl);
  linkEl.addEventListener('click', clickHandler);
};

export const renderPostAsUnread = (post) => {
  const linkEl = document.querySelector(`.posts > ul > li > a[data-id="${post.id}"]`);
  linkEl.classList.remove('font-weight-bold', 'fw-bold');
  linkEl.classList.add('font-weight-normal', 'fw-normal');
};

export const renderFormStatus = (status) => {
  const submit = document.querySelector('button[type=submit]');
  const inputEl = document.querySelector('input');
  const feedbackEl = document.querySelector('.feedback');

  submit.disabled = status === 'loading';

  if (status === 'loading') {
    inputEl.setAttribute('readOnly', true);
  } else {
    inputEl.removeAttribute('readOnly');
  }

  if (status !== 'loading' && status !== 'rssLoaded') {
    inputEl.classList.add('is-invalid');
    feedbackEl.classList.add('text-danger');
    feedbackEl.classList.remove('text-success');
  } else {
    inputEl.classList.remove('is-invalid');
    feedbackEl.classList.remove('text-danger');
    feedbackEl.classList.add('text-success');
    if (status === 'rssLoaded') {
      inputEl.value = '';
    }
  }

  feedbackEl.textContent = i18n.t(`form.status.${status}`);
};
