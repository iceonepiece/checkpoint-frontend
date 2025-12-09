import { oauthApp } from "@/lib/github";

export async function GET(req: Request) {
  const { origin } = new URL(req.url);

  const callbackUrl = `${origin}/api/auth/github/callback`;

  const githubUrl = oauthApp.getWebFlowAuthorizationUrl({
    state: "xyz123",
    redirectUrl: callbackUrl,
  });

  return Response.redirect(githubUrl.url);
}
