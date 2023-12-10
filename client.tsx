import type { WebviewApi } from "npm:@types/vscode-webview@1.57.1";
import { h, hydrate } from "https://esm.sh/preact@10.19.3?pin=v135";
import { App } from "./app.tsx";
import { rootElementId } from "./constant.ts";

const getAcquireVsCodeApi = (): WebviewApi<unknown> | undefined => {
  if (typeof window.acquireVsCodeApi === "function") {
    return window.acquireVsCodeApi();
  }
  return undefined;
};

const vscodeWebviewApi = getAcquireVsCodeApi();
console.log("state", vscodeWebviewApi?.getState());

const rootElement = document.getElementById(rootElementId);

if (rootElement === null) {
  document.body.append("エラー: id が root の Element を見つけられなかった");
} else {
  hydrate(<App />, rootElement);
}
