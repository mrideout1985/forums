import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  layout('components/AppLayout.tsx', [
    index('routes/hot.tsx'),
    route('forums', 'routes/forums.tsx'),
    route('forums/:forumSlug', 'routes/forum.tsx'),
    route('forums/:forumSlug/posts/new', 'routes/new-post.tsx'),
    route('forums/:forumSlug/posts/:postSlug', 'routes/post.tsx'),
  ]),
] satisfies RouteConfig;
