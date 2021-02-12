import objectHash from 'object-hash';

export class RssError extends Error {}

const generateId = (obj) => objectHash(obj).substr(0, 8);

const parseFeedsFromResponseData = (data) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(data.contents, 'text/xml');

  const feedProps = {
    name: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
  };
  const feed = { id: generateId(feedProps), ...feedProps };

  // https://developer.mozilla.org/ru/docs/Web/API/NodeList#%D0%BA%D0%BE%D0%BD%D0%B2%D0%B5%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5_nodelist_%D0%B2_array
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
    return Promise.reject(new RssError('networkError'));
  }
  return response.json().catch(() => Promise.reject(new RssError('parseError')));
};

export const handleResponse = (data) => {
  const { contents } = data;
  if (!contents || typeof contents !== 'string' || contents.indexOf('rss ') === (-1)) {
    return { status: 'nonRss' };
  }
  return { ...parseFeedsFromResponseData(data), status: 'rssLoaded' };
};
