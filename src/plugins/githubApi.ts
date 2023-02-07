export default defineNuxtPlugin((nuxtApp) => {
  const github = useGithubProfile();

  const request = function (uri: string) {
    return async (query: object = {}): Promise<any> => {
      if (github.value.auth === undefined) {
        throw new Error("Unauthorized.");
      }
      const baseURL = "https://api.github.com/";
      return $fetch(
        `${baseURL}${uri.startsWith("/") ? uri.substring(1) : uri}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${github.value.auth?.accessToken}`,
          },
          query,
        }
      );
    };
  };
  return {
    provide: {
      githubApi: {
        getUser: request("/user"),
        getUserRepos: request("/user/repos"),
      },
    },
  };
});
