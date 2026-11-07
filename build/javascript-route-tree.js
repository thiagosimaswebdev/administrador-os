import { existsSync, writeFileSync } from "node:fs";

export function javascriptRouteTree() {
  return {
    name: "javascript-route-tree",
    enforce: "pre",
    transform(code, id) {
      const filePath = id.split("?")[0];
      if (!filePath.replaceAll("\\", "/").endsWith("/src/routeTree.gen.js")) return null;
      const javascript = code.replace(/\nimport type \{ getRouter \}[\s\S]*$/, "");
      if (process.env.NODE_ENV === "production" && javascript !== code && existsSync(filePath)) {
        writeFileSync(filePath, javascript);
      }
      return javascript;
    },
  };
}
