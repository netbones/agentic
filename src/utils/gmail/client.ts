import { google } from "@googleapis/gmail";

export function getGmailClient(accessToken: string) {
  const auth = new (google as any).auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}
