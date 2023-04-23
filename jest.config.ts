import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  moduleFileExtensions: ["js", "ts", "tsx"],
  preset: "ts-jest/presets/default",
  transform: {
    ".spec.tsx?$": "ts-jest",
  },
  verbose: true,
};

export default config;
