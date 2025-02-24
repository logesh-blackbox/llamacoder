import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".vscode",
  "coverage",
]);

const EXCLUDED_FILES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
]);

function isExcluded(name: string): boolean {
  return (
    EXCLUDED_DIRS.has(name) ||
    EXCLUDED_FILES.has(name) ||
    name.startsWith(".") ||
    name.endsWith(".log")
  );
}

function getDirectoryStructure(dirPath: string) {
  const items = fs.readdirSync(dirPath);
  const structure = [];

  for (const item of items) {
    if (isExcluded(item)) continue;

    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      structure.push({
        name: item,
        type: "directory",
        children: getDirectoryStructure(fullPath),
      });
    } else {
      structure.push({
        name: item,
        type: "file",
      });
    }
  }

  return structure.sort((a, b) => {
    // Directories first, then files
    if (a.type === "directory" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const structure = getDirectoryStructure(projectRoot);
    
    return NextResponse.json({ files: structure });
  } catch (error) {
    console.error("Error reading directory structure:", error);
    return NextResponse.json(
      { error: "Failed to read directory structure" },
      { status: 500 }
    );
  }
}
