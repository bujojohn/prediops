import { NextRequest, NextResponse } from "next/server";
import { sportmonks } from "@/lib/sportmonks";
import { mockLiveFixtures } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const useMock = url.searchParams.get("mock") === "1";
    if (useMock) {
      return NextResponse.json({
        success: true,
        data: mockLiveFixtures,
        timestamp: new Date().toISOString(),
        count: mockLiveFixtures.data.length,
        note: "Using mock data by request",
      });
    }
    const liveFixtures = await sportmonks.getLiveFixtures({
      include: "participants;scores;state;predictions;league;venue",
      sortBy: "starting_at",
      order: "desc",
      per_page: 50,
    });
    return NextResponse.json({
      success: true,
      data: liveFixtures,
      timestamp: new Date().toISOString(),
      count: liveFixtures?.data?.length || 0,
    });
  } catch (error) {
    console.error("Live Fixtures API Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch live fixtures",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
