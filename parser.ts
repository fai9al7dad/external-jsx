import * as fs from "fs";
import * as ts from "typescript";

// Define the file naming convention
const componentFileExtension = ".tsx";
const templateFileExtension = `.template.${componentFileExtension}`;

function parseImports(filePath: string): string[] {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContents,
    ts.ScriptTarget.Latest,
    true
  );
  const imports: string[] = [];
  function getImports(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      imports.push(fileContents.substring(node.pos, node.end));
    }
    ts.forEachChild(node, getImports);
  }
  getImports(sourceFile);
  return imports;
}

function parseJsx(filePath: string): string | null {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContents,
    ts.ScriptTarget.Latest,
    true
  );
  // TODO:: throw error if more than one root node is found

  let jsxMarkup: string | null = null;
  function getRootNode(node: ts.Node): string | void {
    // parse until you find the first jsx element
    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      // if found root then return and stop looping
      jsxMarkup = fileContents
        .substring(node.pos, node.end)
        .replace(/^\s+/, "");
      return;
    }
    ts.forEachChild(node, getRootNode);
  }

  getRootNode(sourceFile);

  return jsxMarkup;
}

const isComponentFile = (file: string): boolean => {
  return file.endsWith(".tsx") && !file.endsWith(templateFileExtension);
};

function parseDirectory(directoryPath: string): void {
  const files = fs.readdirSync(directoryPath);
  files.forEach((file) => {
    const filePath = `${directoryPath}/${file}`;
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      parseDirectory(filePath);
    } else if (stats.isFile()) {
      if (isComponentFile(file)) {
        const fileContents = fs.readFileSync(filePath, "utf-8");
        const templateTag = fileContents.match(
          /<Template\s*dir\s*=\s*.*\s*\/>/
        );
        if (templateTag) {
          let dirValue = templateTag[0].split(/"|'.+"|'/)[1];
          if (!dirValue.endsWith(templateFileExtension)) {
            new Error(
              `Template file ${dirValue} does not have the correct extension. Expected ${templateFileExtension}`
            );
          }
          if (dirValue.startsWith("/")) {
            dirValue = dirValue.substring(1);
          }
          const templateFilePath = `${directoryPath}/${dirValue}`;
          const jsxMarkup = parseJsx(templateFilePath);
          const imports = parseImports(templateFilePath);

          if (jsxMarkup) {
            const componentCode = fileContents.replace(
              /<Template\s*dir\s*=\s*.*\s*\/>/,
              jsxMarkup
            );
            fs.writeFileSync(filePath, componentCode);

            const importStatements = imports.join("\n");
            fs.appendFileSync(filePath, `\n${importStatements}`);
          }
        }
      }
    }
  });
}
