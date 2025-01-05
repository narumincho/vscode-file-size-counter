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
  Webview,
} from "jsr:@narumincho/vscode";
import { Message, rootElementId, viewType } from "./constant.ts";
import { h } from "npm:preact";
import { renderToString } from "npm:preact-render-to-string";
import { App } from "./app.tsx";

function activate(context: ExtensionContext) {
  const vscode = importVsCodeApi();
  if (vscode === undefined) {
    throw new Error(
      "Could not import vscode api because it was not working within the extension",
    );
  }

  const eventEmitter = new vscode.EventEmitter<
    CustomDocumentContentChangeEvent<FileSizeCounterEditorDocument>
  >();

  const webviewList: Array<{ readonly uri: Uri; readonly webview: Webview }> =
    [];

  vscode.workspace.onDidChangeTextDocument((e) => {
    console.log("onDidChangeTextDocument", e.document.uri.toString());
    for (const { uri, webview } of webviewList) {
      if (uri.toString() === e.document.uri.toString()) {
        const message: Message = {
          type: "sizeChanged",
          size: new TextEncoder().encode(e.document.getText()).length,
        };
        webview.postMessage(message);
      }
    }
  });

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
    resolveCustomEditor: async (document, webviewPanel, _token) => {
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
              <div
                id={rootElementId}
                data-size={`${document.originalBinary.length}`}
              >
                <App size={100} />
              </div>
            </body>
          </html>,
        );
      webviewList.push({ uri: document.uri, webview: webviewPanel.webview });
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

type FileSizeCounterEditorDocument = CustomDocument & {
  originalBinary: Uint8Array;
};

declare global {
  let module: { exports: { activate: typeof activate } };
}

module.exports = {
  activate,
};
