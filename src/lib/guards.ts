import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "USER" | "ADMIN";
};

export async function requireUser(): Promise<
  { user: SessionUser } | { error: NextResponse }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = session.user as SessionUser;

  // Check if user is blocked (covers sessions issued before blocking)
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { isBlocked: true },
  });
  if (dbUser?.isBlocked) {
    return {
      error: NextResponse.json(
        { error: "Account has been blocked" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function requireAdmin(): Promise<
  { user: SessionUser } | { error: NextResponse }
> {
  const result = await requireUser();
  if ("error" in result) {
    return result;
  }
  if (result.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 }
      ),
    };
  }
  return result;
}
