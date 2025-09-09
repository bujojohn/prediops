import { NextResponse } from "next/server";
import { sportmonks } from "@/lib/sportmonks";
import { isAxiosError } from "axios";

export async function GET(
  request: Request,
  { params }: { params: { fixtureId: string } }
) {
  try {
    const { fixtureId } = params;
    
    if (!fixtureId) {
      return NextResponse.json(
        { success: false, message: "Missing fixtureId parameter" },
        { status: 400 }
      );
    }

    const data = await sportmonks.getValueBetsByFixtureId(fixtureId, {
      include: "fixture:name,starting_at",
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    let status = 500;
    let data: unknown = undefined;
    let message = "Internal Server Error";

    if (isAxiosError(error)) {
      status = error.response?.status ?? 500;
      data = error.response?.data;
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("/api/sportmonks/value-bets/fixture/[fixtureId] error", {
      fixtureId: params.fixtureId,
      status,
      message,
      data,
    });
    
    return NextResponse.json({ success: false, message, data }, { status });
  }
}
