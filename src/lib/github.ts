import { OAuthApp } from "@octokit/oauth-app";

export const oauthApp = new OAuthApp({
  clientType: "github-app",
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
});
