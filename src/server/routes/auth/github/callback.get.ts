import { H3Response } from "h3";
import { z, useSafeValidatedQuery } from "h3-zod";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const parsed = useSafeValidatedQuery(
    event,
    z.object({
      code: z.string().optional(),
      error: z.string().optional(),
      error_description: z.string().optional(),
    })
  );

  const redirectionURL = new URL(
    "close-popup",
    config.oauthHost ?? "http://localhost:3000/"
  );

  if (parsed.success) {
    if (typeof parsed.data.code === "string") {
      const data: any = await $fetch("/login/oauth/access_token", {
        baseURL: "https://github.com",
        method: "post",
        headers: {
          Accept: "application/json",
        },
        body: {
          client_id: config.public.oauthGithubClientId,
          client_secret: config.oauthGithubClientSecret,
          code: parsed.data.code,
        },
      });
      redirectionURL.searchParams.set("access_token", data.access_token);
      redirectionURL.searchParams.set("token_type", data.token_type);
      redirectionURL.searchParams.set("scope", data.scope);
    } else {
      redirectionURL.searchParams.set("error", parsed.data.error!);
      redirectionURL.searchParams.set(
        "error_description",
        encodeURIComponent(parsed.data.error_description!)
      );
    }
  } else {
    redirectionURL.searchParams.set("error", "Failed to parse query");
  }

  return sendRedirect(event, redirectionURL.toString(), 302);
});
