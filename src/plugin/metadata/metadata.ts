import resolvePkg from 'resolve-pkg';
import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import {
  DefinitionInfoAndBoundSpan,
  LineAndCharacter,
  ScriptElementKind,
  TextSpan,
} from 'typescript/lib/tsserverlibrary';
import { getTokenSpanMatchingPattern } from '../utils';
import { Services } from '../utils/services.types';
import { MetadataService } from './metadata.types';

/**
 * Handles metadata requests such as signature and definition info.
 *
 * @privateRemarks Unlikely that these types of actions will be custom element dialect specific
 * (e.g. not FAST or Lit specific) so this is just implemented as a core service, but could
 * be extended using the same pattern as completions and diagnostics in future if required.
 */
export class CoreMetadataService implements MetadataService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log(`Setting up CoreMetadataService`);
  }

  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter
  ): DefinitionInfoAndBoundSpan {
    const maybeTokenSpan = getTokenSpanMatchingPattern(position, context, /[\w-]/);
    if (!maybeTokenSpan) {
      return {
        textSpan: { start: 0, length: 0 },
      };
    }

    const { start, length } = maybeTokenSpan;
    const token = context.rawText.slice(start, start + length);

    if (this.services.customElements.customElementKnown(token)) {
      return this.getCustomElementDefinitionInfo(maybeTokenSpan, token, context);
    }

    return {
      textSpan: maybeTokenSpan,
    };
  }

  /**
   * If the token is a custom element, try and find the definition in the source file.
   */
  private getCustomElementDefinitionInfo(
    tokenSpan: TextSpan,
    tagName: string,
    context: TemplateContext
  ): DefinitionInfoAndBoundSpan {
    const path = this.services.customElements.getCEPath(tagName, { getFullPath: true });
    if (!path) {
      throw new Error("Couldn't find path for custom element with tagName: " + path);
    }

    let maybeFileName: string | null = null;

    if (!path.includes('node_modules')) {
      maybeFileName = this.services.io.getNormalisedRootPath() + path;
    } else {
      maybeFileName = this.tryFindPathOfDependencyFile(tagName, path);
    }

    if (typeof maybeFileName !== 'string') {
      this.logger.log(
        `getCustomElementDefinitionInfo - Unable to get filename of definition for tag ${tagName}`
      );
      return {
        textSpan: tokenSpan,
      };
    }

    const tagDefinitionName = this.services.customElements.getCEDefinitionName(tagName);
    // naive but simple approach to finding the definition location in the source file
    const definitionStart = this.services.io.getLocationOfStringInFile(
      maybeFileName,
      tagDefinitionName ?? ''
    );
    if (!definitionStart) {
      throw new Error(
        `Couldn't find definition for custom element with tagName: ${tagDefinitionName} defined in file ${maybeFileName}`
      );
    }

    // If we return the `textSpan` start of the definition as the location of the definition in the source file,
    // this is wrong because the API then adds on the offset of the start of the *current* template
    // string onto the start. So we need to manually get the node text start ourselves and subtract
    // it to cancel out the offset.
    const nodeTextStart = context.node.getStart();
    let start = definitionStart - nodeTextStart - 1;
    if (start < 0) start = 0;

    return {
      textSpan: tokenSpan,
      definitions: [
        {
          fileName: maybeFileName,
          textSpan: { start, length: tagName.length },
          kind: ScriptElementKind.classElement,
          containerKind: ScriptElementKind.moduleElement,
          containerName: 'file',
          name: tagName,
        },
      ],
    };
  }

  private tryFindPathOfDependencyFile(tagName: string, longPathName: string): string | null {
    const npmPackageName = this.services.customElements.getCEPath(tagName, { getFullPath: false });
    if (npmPackageName === null) return null;

    const pkgPath = resolvePkg(npmPackageName);
    if (typeof pkgPath === 'undefined') return null;
    const filePathFromPackageRoot = longPathName.replace('node_modules/' + npmPackageName, '');

    if (this.services.io.fileExists(pkgPath + filePathFromPackageRoot)) {
      // Direct source file exists
      return pkgPath + filePathFromPackageRoot;
    }

    const filePathInPkgAsJS = filePathFromPackageRoot
      .replace('.ts', '.js')
      .replace(/dist\/.+?\//, 'dist/esm/');
    if (this.services.io.fileExists(pkgPath + filePathInPkgAsJS)) {
      // JS output exists
      return pkgPath + filePathInPkgAsJS;
    }

    return null;
  }
}
