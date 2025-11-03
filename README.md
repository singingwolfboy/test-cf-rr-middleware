# Minimal test for React Router's v8_middleware on Cloudflare Workers

It appears that `v8_middleware` fails on Cloudflare Workers,
at least for the dev server. To create this repo, I did the following:

1. Created a basic application for running React Router on Cloudflare Workers, [following the instructions on the Cloudflare documentation](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/):

  ```
  npm create cloudflare@latest -- my-react-router-app --framework=react-router
  ```

2. Set `v8_middleware: true` in `react-router.config.ts`

3. Deleted `entry.server.tsx` and added `@react-router/node` to the dependencies, to ensure that we're using the default React Router server entry code.

4. Added an `app/context.ts` file, with a context for the
  Cloudflare environment

5. In `workers/app.ts`, modified the `fetch` function to create a
  `RouterContextProvider` and set the Cloudflare environment on the context

6. In `app/routes/home.tsx`, modified the `loader` function
  to get the Cloudflare environment from the context

  ## Results

  When I run `npm run dev`, I get the following error:

```
[vite] Internal server error: Failed to load url node:stream (resolved id: node:stream) in /Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx. Does the file exist?
      at CustomModuleRunner.cachedModule (workers/runner-worker.js:1302:20)
      at request (workers/runner-worker.js:1152:83)
      at null.<anonymous> (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx:1:1)
      at Object.runInlinedModule (workers/runner-worker.js:1403:4)
      at CustomModuleRunner.directRequest (workers/runner-worker.js:1206:59)
      at CustomModuleRunner.cachedRequest (workers/runner-worker.js:1113:73)
      at null.<anonymous> (/server-build/virtual:react-router/server-build:2:5)
      at Object.runInlinedModule (workers/runner-worker.js:1403:4)
      at CustomModuleRunner.directRequest (workers/runner-worker.js:1206:59)
      at CustomModuleRunner.cachedRequest (workers/runner-worker.js:1113:73)
[vite] Unexpected Node.js imports for environment "ssr". Do you need to enable the "nodejs_compat" compatibility flag? Refer to https://developers.cloudflare.com/workers/runtime-apis/nodejs/ for more details.
 - "node:stream" imported from "node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx"
```


## `nodejs_compat` flag
I can try setting the "nodejs_compat" compatibility flag, but it still fails with a different error. To set the flag,
I add this line to `wrangler.jsonc`:

```
"compatibility_flags": ["nodejs_compat"],
```

Then when I run the app, I get this error instead:

```
TypeError: renderToPipeableStream is not a function
    at /Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx:39:29
    at new Promise (<anonymous>)
    at handleRequest (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx:21:10)
    at renderHtml (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:12138:22)
    at staticHandler.query.generateMiddlewareResponse (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:12025:27)
    at /Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:3498:23
    at callRouteMiddleware (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:4736:18)
    at runMiddlewarePipeline (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:4714:16)
    at Object.query (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:3487:24)
    at handleDocumentRequest (/Users/singingwolfboy/clones/test-cf-rr-middleware/node_modules/.vite/deps_ssr/chunk-GQ5LZAPK.js:12019:18)
```

That's not a surprise, since [some of these APIs are stubs, and not actually implemented](https://developers.cloudflare.com/workers/runtime-apis/nodejs/). Presumably, `renderToPipeableStream` is one of these stubs (or depends on one of them).