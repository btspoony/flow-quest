export default defineNuxtPlugin((nuxtApp) => {
  const github = useGithubProfile();

  const request = function (uri: string) {
    return async (
      opts: {
        query?: { [key: string]: any };
        params?: { [key: string]: any };
      } = {}
    ): Promise<any> => {
      if (github.value.auth === undefined) {
        throw new Error("Unauthorized.");
      }
      const baseURL = "https://api.github.com/";
      let mergedUri = uri.startsWith("/") ? uri.substring(1) : uri;
      if (typeof opts.params === "object") {
        for (const key in opts.params) {
          mergedUri = mergedUri.replaceAll(`:${key}`, opts.params[key]);
        }
      }
      return $fetch(baseURL + mergedUri, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${github.value.auth?.accessToken}`,
        },
        query: opts.query,
      });
    };
  };
  return {
    provide: {
      githubApi: {
        getUser: request("/user"),
        listUserRepos: request("/user/repos"),
        listRepoContributors: request("/repos/:owner/:repo/contributors"),
      },
    },
  };
});
