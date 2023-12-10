export const viewType = "narumincho.file-size-counter";

export const rootElementId = "root";

export type Message = {
  readonly type: "sizeChanged";
  readonly size: number;
};
