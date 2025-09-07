import { NextResponse } from "next/server";
import { sportmonks } from "@/lib/sportmonks";

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
  } catch (error) {
    console.error("/api/sportmonks/fixtures/head-to-head error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


