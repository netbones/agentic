import { env } from "@/utils/env";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import type { Prisma } from "@prisma/client";
import { encryptToken, decryptToken } from "@/utils/encryption";

// Minimal Prisma extension to encrypt/decrypt account tokens
const encryptedTokens = {
  model: {
    Account: {
      async create({ args, query }: Prisma.MiddlewareParams & any) {
        if (args.data?.access_token) args.data.access_token = encryptToken(args.data.access_token);
        if (args.data?.refresh_token) args.data.refresh_token = encryptToken(args.data.refresh_token);
        return query(args);
      },
      async update({ args, query }: Prisma.MiddlewareParams & any) {
        if (args.data?.access_token) args.data.access_token = encryptToken(args.data.access_token);
        if (args.data?.refresh_token) args.data.refresh_token = encryptToken(args.data.refresh_token);
        return query(args);
      },
    },
  },
  result: {
    Account: {
      access_token: {
        needs: {},
        compute(val: string | null) {
          return decryptToken(val);
        },
      },
      refresh_token: {
        needs: {},
        compute(val: string | null) {
          return decryptToken(val);
        },
      },
    },
  },
} as const;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createClient() {
  let client = new PrismaClient({ datasourceUrl: env.DATABASE_URL }) as unknown as PrismaClient;
  client = (client as any).$extends(encryptedTokens);

  if (env.DATABASE_URL?.startsWith("prisma://")) {
    client = (client as any).$extends(withAccelerate()) as PrismaClient;
  }
  return client;
}

const _prisma = global.prisma || createClient();
if (env.NODE_ENV === "development") global.prisma = _prisma;

export default _prisma;
