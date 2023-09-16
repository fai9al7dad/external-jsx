import * as fs from "fs";
import * as ts from "typescript";

// Define the file naming convention
const componentFileExtension = ".tsx";
const templateFileExtension = `.template.${componentFileExtension}`;

// this function will return the jsx markup for a given template file path
function parseTemplateFile(filePath: string): string | null {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContents,
    ts.ScriptTarget.Latest,
    true
  );

  // TODO:: Allow imports in template files -> possibly by assuming that everything before the first root node is an import

  return parseJsx(fileContents, sourceFile);
}

function parseJsx(
  fileContents: string,
  sourceFile: ts.SourceFile
): string | null {
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
      jsxMarkup = fileContents.substring(node.pos, node.end);
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
          const jsxMarkup = parseTemplateFile(templateFilePath);
          if (jsxMarkup) {
            const componentCode = fileContents.replace(
              /<Template\s*dir\s*=\s*.*\s*\/>/,
              jsxMarkup
            );
            fs.writeFileSync(filePath, componentCode);
          }
        }
      }
    }
  });
}

parseDirectory("./example/src");

//         const componentCode = fs
//             .readFileSync(componentFilePath, "utf-8")
//             .replace(/<Template\s*dir\s*=\s*.*\s*\/>/, jsxMarkup);
