import { NextResponse } from "next/server";
import { sportmonks } from "@/lib/sportmonks";
import { isAxiosError } from "axios";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const team1Id = (searchParams.get("team1Id") || "").trim();
    const team2Id = (searchParams.get("team2Id") || "").trim();

    if (!team1Id || !team2Id) {
      return NextResponse.json(
        { error: "Missing required query params: team1Id, team2Id" },
        { status: 400 }
      );
    }

    const include = searchParams.get("include") || "participants:name;scores;state;league";
    const per_page = Number(searchParams.get("per_page") || 25);
    const page = Number(searchParams.get("page") || 1);

    const data = await sportmonks.getFixturesByHeadToHead(team1Id, team2Id, {
      include,
      per_page,
      page,
      sortBy: "starting_at",
      order: "desc",
    });

    return NextResponse.json(data, { status: 200 });
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

    console.error("/api/sportmonks/fixtures/head-to-head error", {
      status,
      message,
      data,
    });
    return NextResponse.json({ success: false, message, data }, { status });
  }
}


