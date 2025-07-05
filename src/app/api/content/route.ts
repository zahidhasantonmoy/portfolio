import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import data from "../../../../public/data.json"; // Directly import data.json
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "public", "data.json");

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

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const updatedData = await req.json();
    // For POST, we still need fs to write to the file system if data is mutable
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2));
    return NextResponse.json({ message: "Portfolio data updated successfully" });
  } catch (error) {
    console.error("Error writing data.json:", error);
    return NextResponse.json(
      { message: "Error updating portfolio data" },
      { status: 500 }
    );
  }
}
