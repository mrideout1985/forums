import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  layout('components/ProtectedRoute.tsx', [index('routes/dashboard.tsx')]),
] satisfies RouteConfig;
