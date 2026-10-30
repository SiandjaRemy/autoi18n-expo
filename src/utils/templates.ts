import * as t from "@babel/types";

/**
 * "Simple" interpolations we can turn into one i18n key + params.
 * - ${name}
 * - ${task.title}  (non-computed member, identifier object)
 * Not simple: calls, nested ternaries, optional chaining chains you don't want, etc.
 */
export function isSimpleTemplateExpression(expr: t.Expression): boolean {
  if (t.isIdentifier(expr)) return true;

  if (
    t.isMemberExpression(expr) &&
    !expr.computed &&
    t.isIdentifier(expr.property) &&
    (t.isIdentifier(expr.object) || t.isThisExpression(expr.object))
  ) {
    return true;
  }

  return false;
}

export function templateHasOnlySimpleExpressions(
  node: t.TemplateLiteral,
): boolean {
  return node.expressions.every((e) =>
    isSimpleTemplateExpression(e as t.Expression),
  );
}

/** Param name for locale {{param}} and t(..., { param: ... }) */
export function paramNameFromExpression(expr: t.Expression): string {
  if (t.isIdentifier(expr)) return expr.name;

  if (
    t.isMemberExpression(expr) &&
    t.isIdentifier(expr.property) &&
    !expr.computed
  ) {
    // task.title → title (matches common i18n style)
    return expr.property.name;
  }

  return "arg0";
}

function isSimpleTemplateExpressionNode(expr: any): boolean {
  if (!expr) return false;
  if (expr.type === "Identifier") return true;
  if (
    expr.type === "MemberExpression" &&
    !expr.computed &&
    expr.property?.type === "Identifier" &&
    (expr.object?.type === "Identifier" ||
      expr.object?.type === "ThisExpression")
  ) {
    return true;
  }
  return false;
}

export function templateHasOnlySimpleExpressionsNode(node: any): boolean {
  return (node.expressions ?? []).every(isSimpleTemplateExpressionNode);
}
