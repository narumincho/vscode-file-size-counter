import {
  CancellationToken,
  CustomDocument,
  CustomDocumentBackup,
  CustomDocumentContentChangeEvent,
  CustomDocumentOpenContext,
  CustomEditorProvider,
  ExtensionContext,
  importVsCodeApi,
  Uri,
} from "https://deno.land/x/vscode@1.83.0/mod.ts";
import { rootElementId, viewType } from "./constant.ts";
import { h } from "https://esm.sh/preact@10.19.3?pin=v135";
import { renderToString } from "https://esm.sh/preact-render-to-string@6.3.1?pin=v135";
import { App } from "./app.tsx";

export function activate(context: ExtensionContext) {
  const vscode = importVsCodeApi();
  if (vscode === undefined) {
    throw new Error(
      "Could not import vscode api because it was not working within the extension",
    );
  }

  const eventEmitter = new vscode.EventEmitter<
    CustomDocumentContentChangeEvent<FileSizeCounterEditorDocument>
  >();
  /**
   * https://code.visualstudio.com/api/extension-guides/custom-editors
   */
  const customEditorProvider: CustomEditorProvider<
    FileSizeCounterEditorDocument
  > = {
    // deno-lint-ignore require-await
    backupCustomDocument: async (
      document,
      _context,
      _cancellation,
    ): Promise<CustomDocumentBackup> => {
      return {
        id: document.uri.toString(),
        delete: () => {},
      };
    },
    onDidChangeCustomDocument: eventEmitter.event,
    openCustomDocument: async (
      uri: Uri,
      _openContext: CustomDocumentOpenContext,
      _token: CancellationToken,
    ): Promise<FileSizeCounterEditorDocument> => {
      const file = await vscode.workspace.fs.readFile(uri);
      return {
        uri,
        originalBinary: file,
        dispose: () => {},
      };
    },
    // deno-lint-ignore require-await
    resolveCustomEditor: async (_document, webviewPanel, _token) => {
      webviewPanel.webview.options = {
        enableScripts: true,
      };
      const scriptUri = webviewPanel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "client.js"),
      );
      webviewPanel.webview.html = "<!doctype html>" +
        renderToString(
          <html>
            <head>
              <meta charset="utf-8" />
              <title>file-size-counter</title>
              <script type="module" src={scriptUri.toString()} />
            </head>
            <body>
              <div id={rootElementId}>
                <App />
              </div>
            </body>
          </html>,
        );
    },
    saveCustomDocument: async (document, _cancellation) => {
      await vscode.workspace.fs.writeFile(
        document.uri,
        document.originalBinary,
      );
    },
    saveCustomDocumentAs: async (document, destination, _cancellation) => {
      await vscode.workspace.fs.writeFile(
        destination,
        document.originalBinary,
      );
    },
    revertCustomDocument: async (document, _cancellation) => {
      const file = await vscode.workspace.fs.readFile(document.uri);
      document.originalBinary = file;
    },
  };
  const provider = vscode.window.registerCustomEditorProvider(
    viewType,
    customEditorProvider,
  );
  context.subscriptions.push(provider);
}

export type FileSizeCounterEditorDocument = CustomDocument & {
  originalBinary: Uint8Array;
};
