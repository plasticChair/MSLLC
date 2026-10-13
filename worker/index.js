const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/config') {
      if (request.method !== 'GET') {
        return Response.json({ error: 'Method not allowed.' }, {
          status: 405,
          headers: { Allow: 'GET', 'Cache-Control': 'no-store' },
        });
      }

      const candidate = typeof env.CONTACT_EMAIL === 'string' ? env.CONTACT_EMAIL.trim() : '';
      return Response.json({ contactEmail: emailPattern.test(candidate) ? candidate : '' }, {
        headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found.' }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};