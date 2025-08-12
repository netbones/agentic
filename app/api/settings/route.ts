import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import prisma from "@/utils/prisma";

const saveSchema = z.object({
  llmProvider: z.enum(["openrouter", "mistral"]),
  llmModel: z.string().min(1),
  llmApiKey: z.string().optional().nullable(),
});

export const GET = async () => {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(settings);
};

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const json = await req.json();
  const body = saveSchema.parse(json);

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      llmProvider: body.llmProvider,
      llmModel: body.llmModel,
      llmApiKey: body.llmApiKey ?? undefined,
    },
    create: {
      userId: session.user.id,
      llmProvider: body.llmProvider,
      llmModel: body.llmModel,
      llmApiKey: body.llmApiKey ?? undefined,
    },
  });

  return NextResponse.json(settings);
};
