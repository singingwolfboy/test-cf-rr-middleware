import { RouterContextProvider, createRequestHandler } from "react-router";
import { cloudflareContext } from "~/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(cloudflareContext, env);
    return requestHandler(request, context)
  },
} satisfies ExportedHandler<Env>;
