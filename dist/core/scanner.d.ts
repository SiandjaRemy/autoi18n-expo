import type { eaiConfig } from "../types/config";
/**
 * A single translatable string found in a source file.
 *
 * This is the core data unit that flows through the entire tool:
 *   scanner   → produces ExtractedString[]
 *   scaffolder → consumes ExtractedString[] to write JSON
 *   transformer → consumes ExtractedString[] to rewrite source files
 */
export interface ExtractedString {
    /**
     * Absolute path to the source file this string was found in.
     * Used by the transformer to know which file to rewrite.
     */
    filePath: string;
    /**
     * File path relative to the app root, without extension.
     * Segments are lowercased and non-alphanumeric chars replaced with underscores.
     * Route group parens are stripped.
     *
     * Used to build the namespace prefix of the translation key.
     *
     * @example
     *   src/screens/auth/SignIn.tsx  →  auth.signin
     *   src/components/ui/Button.tsx →  components.ui.button
     */
    namespace: string;
    /**
     * The flat i18n key generated from the string content.
     * Already capped to fit within maxKeyLength when combined with namespace.
     *
     * @example "welcome_back"
     */
    key: string;
    /**
     * The full dotted key as it appears in the locale JSON file.
     * Combines namespace + key.
     *
     * @example "auth.signin.welcome_back"
     */
    fullKey: string;
    /**
     * The raw string as it appears in source code.
     * For plain strings: the string itself.
     * For template literals: the static parts joined with {{placeholders}}.
     *
     * @example "Welcome back"
     * @example "Hello {{firstName}}, you have {{count}} messages"
     */
    originalText: string;
    /**
     * The translation value to write into the locale JSON file.
     * For plain strings: same as originalText.
     * For template literals: originalText with {{param}} placeholders
     * using the react-i18next interpolation syntax.
     *
     * @example "Welcome back"
     * @example "Hello {{firstName}}, you have {{count}} messages"
     */
    translationValue: string;
    /**
     * Variable names extracted from template literal interpolations.
     * Empty for plain strings.
     *
     * @example [] for "Hello world"
     * @example ["firstName", "count"] for `Hello ${firstName}, you have ${count} messages`
     */
    params: string[];
    /**
     * The type of AST node this string was found in.
     * Used by the transformer to know how to rewrite the node correctly.
     *
     * 'jsx-text'        → <Text>Hello</Text>
     * 'jsx-expression'  → <Text>{"Hello"}</Text> or <Text>{`Hello`}</Text>
     * 'jsx-attribute'   → <Comp title="Hello" />
     * 'alert'           → Alert.alert('Title', 'Message')
     * 'throw'           → throw new Error('Message')
     * 'call'            → toast.show('Message')
     */
    sourceType: "jsx-text" | "jsx-expression" | "jsx-attribute" | "alert" | "throw" | "call" | "return";
    /**
     * The name of the JSX prop this string was found in.
     * Only set when sourceType is 'jsx-attribute'.
     *
     * @example "title", "message", "placeholder"
     */
    propName?: string;
}
/**
 * Parses a single source file and extracts all translatable strings from it.
 *
 * Why Babel AST instead of regex?
 *   - Regex breaks on multiline strings, nested quotes, and comments
 *   - AST parsing understands code structure — we know exactly what
 *     kind of node we're looking at and what its parent is
 *   - We can distinguish className="..." from <Text>...</Text> reliably
 *
 * Babel plugins enabled:
 *   - jsx: understands JSX syntax
 *   - typescript: understands TypeScript types (strips them during parsing)
 *   - decorators-legacy: handles @decorator syntax
 *   - classProperties: handles class field syntax
 *   - optionalChaining: handles a?.b syntax
 *   - nullishCoalescingOperator: handles a ?? b syntax
 *
 * @param filePath  - Absolute path to the source file
 * @param appRoot   - Absolute path to the app root (for namespace generation)
 * @param config    - The loaded i18nauto config
 */
export declare function extractStringsFromFile(filePath: string, appRoot: string, config: eaiConfig): ExtractedString[];
/**
 * Scans an entire React Native project and returns all translatable strings.
 *
 * File discovery uses glob with three layers of exclusion:
 *   1. HARD_EXCLUDED_DIRS — always excluded (node_modules, android, etc.)
 *   2. config.exclude     — user-specified glob patterns
 *   3. .gitignore rules   — respects the project's git exclusions
 *
 * No deduplication is performed — the same string appearing in two files
 * gets two separate entries with different namespaces. This is intentional:
 * each occurrence needs its own key so the transformer can replace each one.
 *
 * @param appRoot - Absolute path to the root of the React Native project
 * @param config  - The loaded i18nauto config
 */
export declare function scanProject(appRoot: string, config: eaiConfig): Promise<ExtractedString[]>;
//# sourceMappingURL=scanner.d.ts.map