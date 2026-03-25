import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080';

export const handlers = [
  http.get(`${BASE}/api/auth/me`, () => {
    return HttpResponse.json(
      { username: 'testuser', email: 'test@example.com', roles: ['ROLE_USER'] },
      { status: 200 }
    );
  }),

  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json(
        {
          token: 'mock.jwt.token',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['ROLE_USER'],
        },
        { status: 200 }
      );
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${BASE}/api/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      username?: string;
      email?: string;
      password?: string;
    };
    if (body.username === 'taken') {
      return HttpResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }
    return HttpResponse.json(
      {
        token: 'mock.jwt.token',
        username: body.username,
        email: body.email,
        roles: ['ROLE_USER'],
      },
      { status: 201 }
    );
  }),

  http.post(`${BASE}/api/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
