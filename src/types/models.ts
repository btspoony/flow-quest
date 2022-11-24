interface ProfileData {
  id: string;
}

interface Profile {
  loggedIn: boolean;
  profile?: ProfileData;
  github?: GithubProfile;
}

interface GithubProfile {
  auth?: {
    tokenType: string;
    scope: string;
    accessToken: string;
  };
  id: number;
  userName: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  bio: string;
  location: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}
