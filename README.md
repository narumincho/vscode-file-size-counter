# vscode-file-size-counter



https://github.com/narumincho/vscode-file-size-counter/assets/16481886/7c79661a-4191-4fa8-a94c-42a56ea31acd



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
