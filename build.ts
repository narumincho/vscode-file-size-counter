import { resolve } from "https://deno.land/std@0.208.0/path/mod.ts";
import { ensureFile } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { viewType } from "./constant.ts";
import { bundle } from "https://deno.land/x/emit@0.32.0/mod.ts";

export const writeTextFileWithLog = async (
  path: string,
  content: string
): Promise<void> => {
  console.log(path.toString() + " に書き込み中... " + content.length + "文字");
  await ensureFile(path);
  await Deno.writeTextFile(path, content);
  console.log(path.toString() + " に書き込み完了!");
};

const buildJavaScript = async (url: string): Promise<string> => {
  return (
    await bundle(url, {
      compilerOptions: { jsxFactory: "h" },
    })
  ).code;
};

const distributionPath = "./distribution";
const mainScriptRelativePath = "./main.js";

await Promise.all([
  writeTextFileWithLog(
    resolve(distributionPath, mainScriptRelativePath),
    await buildJavaScript("./main.tsx")
  ),
  writeTextFileWithLog(
    resolve(distributionPath, "client.js"),
    await buildJavaScript("./client.tsx")
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
