import type { WebviewApi } from "npm:@types/vscode-webview@1.57.1";
import { h, hydrate } from "npm:preact";
import { App } from "./app.tsx";
import { Message, rootElementId } from "./constant.ts";
import {
  useEffect,
  useState,
} from "npm:preact/hooks";

const getAcquireVsCodeApi = (): WebviewApi<unknown> | undefined => {
  if (typeof window.acquireVsCodeApi === "function") {
    return window.acquireVsCodeApi();
  }
  return undefined;
};

const main = () => {
  const rootElement = document.getElementById(rootElementId);

  if (rootElement === null) {
    document.body.append("エラー: id が root の Element を見つけられなかった");
  } else {
    hydrate(
      <AppWithState
        initSize={Number.parseInt(rootElement.dataset.size ?? "")}
      />,
      rootElement,
    );
  }
};

const AppWithState = (props: {
  readonly initSize: number;
}) => {
  const [size, setSize] = useState(props.initSize);

  useEffect(() => {
    const listener = (e: MessageEvent<Message>) => {
      setSize(e.data.size);
    };
    addEventListener("message", listener);
    return () => {
      removeEventListener("message", listener);
    };
  }, []);

  return <App size={size} />;
};

main();
