import { resolve } from "https://deno.land/std@0.208.0/path/mod.ts";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.2/mod.ts";
import {
  build as esBuild,
  type Plugin,
} from "https://deno.land/x/esbuild@v0.19.7/mod.js";
import { ensureFile } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { viewType } from "./constant.ts";

export const writeTextFileWithLog = async (
  path: string,
  content: string
): Promise<void> => {
  console.log(path.toString() + " に書き込み中... " + content.length + "文字");
  await ensureFile(path);
  await Deno.writeTextFile(path, content);
  console.log(path.toString() + " に書き込み完了!");
};

const buildJavaScript = async (
  url: string,
  format: "cjs" | "esm"
): Promise<string> => {
  const esbuildResult = await esBuild({
    entryPoints: [url],
    // esbuild_deno_loader 内部で使われている esbuild の型のバージョンが古いため as を使用
    plugins: denoPlugins() as Plugin[],
    write: false,
    bundle: true,
    format,
    target: ["node18", "chrome120"],
  });

  for (const esbuildResultFile of esbuildResult.outputFiles ?? []) {
    if (esbuildResultFile.path === "<stdout>") {
      const scriptContent = new TextDecoder().decode(
        esbuildResultFile.contents
      );
      return scriptContent;
    }
  }
  throw new Error("esbuild で <stdout> の出力を取得できなかった...");
};

const distributionPath = "./distribution";
const mainScriptRelativePath = "./main.js";

await Promise.all([
  writeTextFileWithLog(
    resolve(distributionPath, mainScriptRelativePath),
    await buildJavaScript("./main.tsx", "cjs")
  ),
  writeTextFileWithLog(
    resolve(distributionPath, "client.js"),
    await buildJavaScript("./client.tsx", "esm")
  ),
  writeTextFileWithLog(
    resolve(distributionPath, "./package.json"),
    JSON.stringify({
      name: "file-size-counter",
      version: "0.0.1",
      description: "file-size-counter using Deno",
      repository: {
        url: "git+https://github.com/narumincho/vscode-file-size-counter.git",
        type: "git",
      },
      license: "MIT",
      homepage: "https://github.com/narumincho/vscode-file-size-counter",
      author: "narumincho",
      engines: {
        vscode: "^1.76.0",
      },
      dependencies: {},
      activationEvents: [],
      /**
       * https://code.visualstudio.com/api/references/contribution-points
       */
      contributes: {
        customEditors: [
          {
            viewType,
            displayName: "file-size-counter",
            selector: [
              {
                filenamePattern: "*",
              },
            ],
            priority: "option",
          },
        ],
      },
      browser: mainScriptRelativePath,
      publisher: "narumincho",
    })
  ),
  writeTextFileWithLog(
    resolve(distributionPath, "README.md"),
    `file-size-counter
`
  ),
]);

// esbuild の影響で停止しないため
Deno.exit();
