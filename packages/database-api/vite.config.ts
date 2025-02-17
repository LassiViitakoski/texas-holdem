import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from "vite-tsconfig-paths";
import { createRequire } from "module";
import path from "path";

/*
const require = createRequire(import.meta.url);

const resolvePrismaClientPath = (
  replacement: string,
  toReplace: string
): string => {
  const regex = new RegExp(`@prisma[\\\\/]client[\\\\/]${replacement}\\.js`);
  const resolvePath =
    replacement !== "default"
      ? `@prisma/client/${replacement}`
      : "@prisma/client";
  return require.resolve(resolvePath).replace(regex, toReplace);
};

const prismaIndexPaths = Object.fromEntries(
  ["index-browser", "edge", "default"].map((key) => [
    key,
    path.normalize(
      path.relative(
        process.cwd(),
        resolvePrismaClientPath(
          key,
          path.join(".prisma", "client", `${key}.js`)
        )
      )
    ).replace(/\\/g, "/")
  ])
);
*/


export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    sourcemap: true,
    minify: true,
  },
  plugins: [dts(), tsconfigPaths()],
  /*
  resolve: {
    alias: {
      ".prisma/client/default": "../../node_modules/.prisma/client/index-browser.js",
      ".prisma/client/index-browser": "../../node_modules/.prisma/client/edge.js",
      ".prisma/client/edge": "../../node_modules/.prisma/client/default.js",
    }
  }
  */
  /*
  "baseUrl": ".",
  "paths": {
    ".prisma/client/index-browser": ["../../../node_modules/.prisma/client/index-browser"],
    ".prisma/client/edge": ["../../../node_modules/.prisma/client/edge"],
    ".prisma/client/default": ["../../../node_modules/.prisma/client/default"]
  }
  */
}); 