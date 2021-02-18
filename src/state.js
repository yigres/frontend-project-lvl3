import onChange from 'on-change';

import {
  getRenderedFeedsCount,
  getRenderedPostsCount,
  renderFeedsHeader,
  renderPostsHeader,
  renderNewFeed,
  renderNewPost,
  renderPostAsUnread,
  renderFormStatus,
} from './render';

const unreadPostsRegExp = /^posts\.(\d+)\.unread$/;

const createWatchedState = (initialState) => {
  const state = onChange(initialState, (path, value) => {
    switch (path) {
      case 'status': {
        renderFormStatus(value);
        break;
      }

      case 'feeds': {
        const { feeds } = state;
        const renderedFeedsCount = getRenderedFeedsCount();
        if (renderedFeedsCount === 0) {
          renderFeedsHeader();
        }
        feeds.forEach((feed, i) => {
          if (i >= renderedFeedsCount && i < feeds.length) {
            const newFeed = feeds[i];
            renderNewFeed(newFeed);
          }
        });
        break;
      }

      case 'posts': {
        const { posts } = state;
        const renderedPostsCount = getRenderedPostsCount();
        if (renderedPostsCount === 0) {
          renderPostsHeader();
        }
        posts.forEach((post, i) => {
          if (i >= renderedPostsCount && i < posts.length) {
            const newPost = posts[i];
            renderNewPost(newPost, () => {
              newPost.unread = false;
            });
          }
        });
        break;
      }

      default: {
        const unreadMatch = path.match(unreadPostsRegExp);
        if (unreadMatch) {
          const { posts } = state;
          const postIndex = Number(unreadMatch[1]);
          const post = posts[postIndex];
          renderPostAsUnread(post);
        }
        break;
      }
    }
  });

  return state;
};

export default createWatchedState;
