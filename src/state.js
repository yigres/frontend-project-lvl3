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
      case 'form.state.status': {
        renderFormStatus(value);
        break;
      }

      case 'feeds': {
        const { feeds } = state;
        const renderedFeedsCount = getRenderedFeedsCount();
        if (renderedFeedsCount === 0) {
          renderFeedsHeader();
        }
        for (let i = renderedFeedsCount; i < feeds.length; i += 1) {
          const feed = feeds[i];
          renderNewFeed(feed);
        }
        break;
      }

      case 'posts': {
        const { posts } = state;
        const renderedPostsCount = getRenderedPostsCount();
        if (renderedPostsCount === 0) {
          renderPostsHeader();
        }
        for (let i = renderedPostsCount; i < posts.length; i += 1) {
          const post = posts[i];
          renderNewPost(post, () => {
            post.unread = false;
          });
        }
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
