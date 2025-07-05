import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import data from "../../../data/data.json"; // Directly import data.json
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "data.json");

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading data.json:", error);
    return NextResponse.json(
      { message: "Error reading portfolio data" },
      { status: 500 }
    );
  }
}
