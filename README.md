# vscode-file-size-counter

## build

```sh
deno run -A ./build.ts
```

## create VSIX file

```sh
cd ./distribution
deno run npm:@vscode/vsce package
```

If it doesn't work... delete ./distribution/node_modules and use Node.js.

```sh
npm install -g @vscode/vsce
cd ./distribution
vsce package
```
