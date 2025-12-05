export default {
  async fetch(request, env, ctx) {
    // Delegate to Cloudflare assets binding to serve static files
    return env.ASSETS.fetch(request, ctx);
  },
};
