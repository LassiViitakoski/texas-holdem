import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the monorepo root directory from script location
const rootDir = path.resolve(__dirname, '../../../').replace(/\\/g, '/');

const resolvePrismaClientPath = (
  replacement,
  toReplace
) => {
  const regex = new RegExp(`@prisma[\\\\/]client[\\\\/]${replacement}\\.js`);
  const resolvePath =
    replacement !== "default"
      ? `@prisma/client/${replacement}`
      : "@prisma/client";

  const resolvedPath = require.resolve(resolvePath).replace(regex, toReplace);
  return resolvedPath;
};

const prismaIndexPaths = Object.fromEntries(
  ["index-browser", "edge", "default"].map((key) => [
    `.prisma/client/${key}`,
    '/' + path.normalize(
      path.relative(
        rootDir,
        resolvePrismaClientPath(
          key,
          path.join(".prisma", "client", key)
        )
      )
    ).replace(/\\/g, "/"),
  ])
);

const tsConfig = fs.readFileSync(path.join(__dirname, '..', 'tsconfig.json'), "utf8");
const tsConfigJson = JSON.parse(tsConfig);
tsConfigJson.compilerOptions.paths = {
  ...tsConfigJson.compilerOptions.paths || {},
  ...Object.entries(prismaIndexPaths).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: [value]
  }), {}),
};

fs.writeFileSync(path.join(__dirname, '..', 'tsconfig.json'), JSON.stringify(tsConfigJson, null, 2));
