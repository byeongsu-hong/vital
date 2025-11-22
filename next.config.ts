import type { NextConfig } from "next";
import { execSync } from "child_process";

function getGitVersion(): string {
  try {
    const version = execSync("git describe --tags --abbrev=0")
      .toString()
      .trim();
    return version;
  } catch {
    return "dev";
  }
}

function getGitCommitHash(): string {
  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim();
    return hash;
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getGitVersion(),
    NEXT_PUBLIC_COMMIT_HASH: getGitCommitHash(),
  },
};

export default nextConfig;
