import { FileInfo, API } from "jscodeshift";
import {
  ExpectMemberExpressionSchema,
  ExpectNotMemberExpressionSchema,
} from "./types";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Add import for `assert/strict` to the top of the file
  // Look for any import declarations
  const importDeclarations = root.find(j.ImportDeclaration);

  // Check if 'node:assert/strict' is already imported
  const assertImported =
    importDeclarations
      .filter((path) => path.node.source.value === "node:assert/strict")
      .size() > 0;

  // If 'node:assert/strict' is not imported, add it
  if (!assertImported) {
    const assertImportDeclaration = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier("assert"))],
      j.literal("node:assert/strict")
    );

    if (importDeclarations.size() > 0) {
      // If there are import declarations, add it at the beginning of the import block
      importDeclarations.at(0).insertBefore(assertImportDeclaration);
    } else {
      // If there are no import declarations, add it at the top of the file
      root.get().node.program.body.unshift(assertImportDeclaration);
    }
  }

  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: { callee: { name: "expect" } },
      },
    })
    .replaceWith((p) => {
      const parsed = ExpectMemberExpressionSchema.parse(p.value);

      const subject = parsed.callee.object.arguments[0];
      const expectation = parsed.arguments[0];

      if (parsed.callee.property.name === "toBe") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("equal")),
          [subject, expectation]
        );
      } else if (parsed.callee.property.name === "toEqual") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("deepEqual")),
          [subject, expectation]
        );
      } else if (parsed.callee.property.name === "toBeNull") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("equal")),
          [subject, j.literal(null)]
        );
      } else if (parsed.callee.property.name === "toBeUndefined") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("equal")),
          [subject, j.undefinedLiteral()]
        );
      } else if (parsed.callee.property.name === "toBeDefined") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("ok")),
          [subject]
        );
      }
      return p.value;
    });

  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: {
          type: "MemberExpression",
          object: { type: "CallExpression", callee: { name: "expect" } },
          property: { type: "Identifier", name: "not" },
        },
      },
    })
    .replaceWith((p) => {
      const data = ExpectNotMemberExpressionSchema.parse(p.value);

      const subject = data.callee.object.object.arguments[0];
      const expectation = data.arguments[0];

      if (data.callee.property.name === "toBe") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("notEqual")),
          [subject, expectation]
        );
      } else if (data.callee.property.name === "toEqual") {
        return j.callExpression(
          j.memberExpression(
            j.identifier("assert"),
            j.identifier("notDeepEqual")
          ),
          [subject, expectation]
        );
      } else if (
        data.callee.property.name === "toBeNull" ||
        data.callee.property.name === "toBeUndefined"
      ) {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("ok")),
          [subject]
        );
      } else if (data.callee.property.name === "toBeDefined") {
        return j.callExpression(
          j.memberExpression(j.identifier("assert"), j.identifier("notOk")),
          [subject]
        );
      }
      return p.value;
    });

  return root.toSource();
}
