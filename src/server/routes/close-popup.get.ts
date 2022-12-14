export default defineEventHandler(async (event) => {
  return `
<html>
<head></head>
<body>
<script>
  console.log(window.opener)
  if (window.opener == null) window.location = "/";

  const url = new URL(window.location);
  const access_token = url.searchParams.get("access_token");
  const token_type = url.searchParams.get("token_type");
  const scope = url.searchParams.get("scope");
  const error = url.searchParams.get("error");
  const error_description = url.searchParams.get("error_description");

  window.opener.postMessage({
    source: "auth-popup",
    payload: {
      access_token,
      token_type,
      scope,
      error,
      error_description
    }
  });

  // window.close();
</script>
</body>
</html>
  `;
});
