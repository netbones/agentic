import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { getGmailClient } from "@/utils/gmail/client";

export const GET = async (_: Request, ctx: { params: { id: string } }) => {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
    select: { access_token: true },
  });
  if (!account?.access_token) {
    return NextResponse.json({ error: "No Google account linked" }, { status: 400 });
  }

  const gmail = getGmailClient(account.access_token);
  const res = await gmail.users.threads.get({ userId: "me", id: ctx.params.id });

  return NextResponse.json(res.data);
};
