// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JSX prop names that carry user-visible text and should be extracted.
 *
 * Conservative by design — only props that are almost certainly
 * shown to the user. Add via customDetectCalls in config as needed.
 */
export const TRANSLATABLE_PROP_NAMES = new Set([
  "title",
  "message",
  "placeholder",
  "label",
  "hint",
  "subtitle",
  "description",
  "caption",
  "errorMessage",
  "helperText",
  "emptyText",
  "confirmText",
  "cancelText",
  "buttonText",
  "header",
  "footer",
  "tooltip",
  "accessibilityLabel",
  "actionLabel",
  "accessibilityHint",
]);

/**
 * Props that are definitively NOT user-visible text.
 * Checked before TRANSLATABLE_PROP_NAMES — takes priority.
 */
export const NON_TRANSLATABLE_PROP_NAMES = new Set([
  "className",
  "style",
  "testID",
  "name",
  "key",
  "id",
  "type",
  "variant",
  "size",
  "color",
  "icon",
  "source",
  "href",
  "to",
  "from",
  "currency",
  "format",
]);

/**
 * Directories always excluded from scanning.
 * These never contain user-facing source code in an Expo project.
 */
export const HARD_EXCLUDED_DIRS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.expo/**",
  "**/android/**",
  "**/ios/**",
  "**/.git/**",
  // Root-level config files — never contain user-facing strings
  "tailwind.config.*",
  "babel.config.*",
  "metro.config.*",
  "jest.config.*",
  "app.config.*",
  "expo-plugins/**",
  "plugins/**",
];

/**
 * Object property key names that are never user-facing text.
 * Always skipped when detectObjectLiterals is true, regardless of
 * objectLiteralExcludeKeys config.
 */
export const OBJECT_LITERAL_BUILTIN_EXCLUDE_KEYS = new Set([
  "id",
  "value",
  "key",
  "name",
  "type",
  "color",
  "icon",
  "href",
  "to",
  "from",
  "src",
  "className",
  "style",
  "testID",
  "variant",
  "size",
  "format",
  "currency",
  "path",
  "route",
  "screen",
  "component",
  "ref",
  "role",
  "filter",
  "status",
  "bg",
]);

/**
 * Returns true if an ObjectExpression looks like a React Native style object.
 *
 * Heuristic: if more than half of the property keys are known RN style
 * property names, treat the whole object as a style object and skip it.
 *
 * This prevents values like "absolute", "hidden", "center" from being
 * extracted when they appear as style prop values.
 */
export const RN_STYLE_KEYS = new Set([
  "position",
  "display",
  "overflow",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "alignContent",
  "flexDirection",
  "flexWrap",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "marginHorizontal",
  "marginVertical",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingHorizontal",
  "paddingVertical",
  "top",
  "bottom",
  "left",
  "right",
  "inset",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderWidth",
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderColor",
  "borderStyle",
  "backgroundColor",
  "opacity",
  "zIndex",
  "elevation",
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "transform",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textDecorationLine",
  "textTransform",
  "color",
  "resizeMode",
  "objectFit",
  "gap",
  "rowGap",
  "columnGap",
  "aspectRatio",
]);
