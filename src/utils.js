import objectHash from 'object-hash';
import i18n from 'i18next';

const generateId = (obj) => objectHash(obj).substr(0, 8);

export const domReady = () => new Promise((resolve) => {
  if (document.readyState === 'complete' || document.readyState === 'loaded') {
    resolve();
  } else {
    document.addEventListener('DOMContentLoaded', resolve);
  }
});

const i18nState = { initialized: false };
export const initI18n = (options) => {
  if (i18nState.initialized) {
    return Promise.resolve();
  }
  return i18n.init(options).then(() => {
    i18nState.initialized = true;
  });
};

const parseFeedsFromResponseData = (data) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(data.contents, 'text/xml');

  const feedProps = {
    name: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
  };
  const feed = { id: generateId(feedProps), ...feedProps };

  const items = Array.prototype.slice.call(doc.querySelectorAll('item'));
  items.reverse();

  const posts = items.map((item) => {
    const postProps = {
      feedId: feed.id,
      name: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    };
    return { id: generateId(postProps), ...postProps, unread: true };
  });

  return { feed, posts };
};

export const parseResponse = (response) => {
  if (!response.ok) {
    return Promise.reject(new Error('responseError'));
  }
  return response.json().catch(() => Promise.reject(new Error('parseError')));
};

export const handleResponse = (data) => {
  const { contents } = data;
  if (!contents || typeof contents !== 'string' || contents.indexOf('rss ') === (-1)) {
    return { status: 'nonRss' };
  }
  return { ...parseFeedsFromResponseData(data), status: 'rssLoaded' };
};
