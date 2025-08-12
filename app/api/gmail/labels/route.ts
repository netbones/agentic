import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { getGmailClient } from "@/utils/gmail/client";

export const GET = async () => {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  // Fetch account by user
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: "No Google account linked" }, { status: 400 });
  }

  const gmail = getGmailClient(account.access_token);
  const res = await gmail.users.labels.list({ userId: "me" });
  const labels = (res.data.labels || []).map((l) => ({ id: l.id, name: l.name }));

  return NextResponse.json(labels);
};
