type Env = {
   ASSETS: {
      fetch(request: Request): Promise<Response>;
   };
};

/**
 * The web Worker serves built static assets. With
 * `not_found_handling: "single-page-application"` unknown paths resolve to
 * `index.html` so the Preact router owns client-side routes.
 */
export default {
   async fetch(request: Request, env: Env): Promise<Response> {
      return env.ASSETS.fetch(request);
   },
};
