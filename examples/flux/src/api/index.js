import GitHubApi from "github";

export default new GitHubApi({
  headers: {
    "user-agent": "Normalizr Flux Example"
  }
});
