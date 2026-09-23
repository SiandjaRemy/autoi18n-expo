import type { ExtractedString } from "./scanner";
import type { LocaleFile } from "./scaffolder";
import { eaiConfig } from "../types/config";
export interface TransformResult {
    filePath: string;
    modified: boolean;
    replacements: number;
    newCode?: string;
}
export declare function transformFile(filePath: string, appRoot: string, strings: ExtractedString[], localeData: LocaleFile, config: eaiConfig): TransformResult;
export declare function transformProject(appRoot: string, strings: ExtractedString[], localeData: LocaleFile): Promise<TransformResult[]>;
//# sourceMappingURL=transformer.d.ts.map