import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      name: "Test Name",
      title: "Test Title",
      aboutMe: "This is test data.",
      skills: [],
      projects: []
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error loading portfolio data" },
      { status: 500 }
    );
  }
}
