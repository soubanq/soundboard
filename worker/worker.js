// Cloudflare Worker: serves the Sijj Soundboard site, puts the Map page behind a
// browser login (default sijj / sijj), and saves clips to the GitHub repo using a
// token that only lives here as a secret.
const PAGES = 'https://soubanq.github.io/soundboard';
const REPO = 'soubanq/soundboard';

const authed = (req, env) => {
  const header = req.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  let creds;
  try { creds = atob(header.slice(6)); } catch { return false; }
  return creds === `${env.ADMIN_USER || 'sijj'}:${env.ADMIN_PASS || 'sijj'}`;
};

const login = () => new Response('Login required', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Sijj Soundboard admin", charset="UTF-8"' },
});

// Only the calls the admin page needs: repo info + the clips folder and mapping file.
const allowedGh = (method, path) => {
  if (path.includes('..')) return false;
  if (path === '') return method === 'GET';
  if (path === 'contents/clips.json') return ['GET', 'PUT'].includes(method);
  return /^contents\/clips\/[\w.\-]+$/.test(path) && ['GET', 'PUT', 'DELETE'].includes(method);
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/gh' || path.startsWith('/gh/')) {
      if (!authed(req, env)) return login();
      const ghPath = path.replace(/^\/gh\/?/, '');
      if (!allowedGh(req.method, ghPath)) return new Response('Not allowed', { status: 403 });
      const res = await fetch(`https://api.github.com/repos/${REPO}${ghPath && '/' + ghPath}${url.search}`, {
        method: req.method,
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'sijj-soundboard-worker',
          'Content-Type': 'application/json',
        },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      });
      return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }

    if (path === '/admin' || path === '/admin.html') {
      if (!authed(req, env)) return login();
      return fetch(`${PAGES}/admin.html`, { cf: { cacheTtl: 0 } });
    }

    // Everything else is the public site, proxied from GitHub Pages.
    return fetch(PAGES + (path === '/' ? '/index.html' : path) + url.search, { cf: { cacheTtl: 0 } });
  },
};
