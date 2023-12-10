import { h } from "https://esm.sh/preact@10.19.3?pin=v135";

export const App = (props: {
  readonly size: number;
}) => {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <div>file size:</div>
        <div style={{ fontSize: 32 }}>{props.size}</div>
      </div>
      <svg viewBox={`0 0 100 ${props.size}`}>
        <rect
          x={0}
          y={0}
          width={100}
          height={props.size}
          style={{ stroke: "green", fill: "transparent" }}
        />
        <rect
          x={30}
          y={10}
          width={10}
          height={props.size - 20}
          style={{ stroke: "black", fill: "white" }}
        />
        <ellipse
          cx={30}
          cy={20}
          rx={20}
          ry={10}
          style={{ stroke: "black", fill: "white" }}
        />
        <circle
          cx={25}
          cy={18}
          r={3}
          style={{ fill: "black" }}
        />
      </svg>
    </div>
  );
};
