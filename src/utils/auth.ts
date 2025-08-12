import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/utils/prisma";
import { env } from "@/utils/env";

export const authOptions: NextAuthConfig = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.settings.basic",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
};
