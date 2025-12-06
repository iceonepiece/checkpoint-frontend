import { oauthApp } from "@/lib/github";

export async function GET() {
  const url = oauthApp.getWebFlowAuthorizationUrl({
    state: "xyz123",
  });

  return Response.redirect(url.url);
}
