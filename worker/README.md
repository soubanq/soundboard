# Cloudflare Worker setup (one-time, free)

1. Create a fine-grained GitHub token (github.com/settings/personal-access-tokens): only the
   `soubanq/soundboard` repo, **Contents: Read and write**.
2. Sign up at cloudflare.com (free), then **Workers & Pages → Create → Create Worker**, deploy the
   hello-world, then **Edit code**, paste in `worker.js`, and **Deploy**.
3. Worker **Settings → Variables and Secrets**: add a secret named `GITHUB_TOKEN` with the token.
   (Optional: `ADMIN_USER` / `ADMIN_PASS` to change the login from the default `sijj` / `sijj`.)
4. Put the Worker URL (e.g. `https://sijj.yourname.workers.dev`) in `config.js` as `SIJJ_WORKER`
   and push. The Map links then jump to the Worker, which shows the browser login prompt.
