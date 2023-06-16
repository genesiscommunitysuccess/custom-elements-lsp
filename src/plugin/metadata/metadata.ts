import resolvePkg from 'resolve-pkg';
import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import {
  DefinitionInfoAndBoundSpan,
  LineAndCharacter,
  QuickInfo,
  ScriptElementKind,
  TextSpan,
} from 'typescript/lib/tsserverlibrary';
import { getTokenSpanMatchingPattern } from '../utils';
import { Services } from '../utils/services.types';
import { MetadataService, QuickInfoCtx } from './metadata.types';

/**
 * Handles metadata requests such as signature and definition info.
 */
export class CoreMetadataServiceImpl implements MetadataService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log(`Setting up CoreMetadataService`);
  }

  getQuickInfoAtPosition({ token, tokenSpan }: QuickInfoCtx): QuickInfo | undefined {
    if (this.services.customElements.customElementKnown(token)) {
      return this.quickInfoForCustomElement(tokenSpan, token);
    }

    return undefined;
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

  private quickInfoForCustomElement(tokenSpan: TextSpan, tagName: string): QuickInfo {
    const customElementInfo = this.services.customElements
      .getAllCEInfo({ getFullPath: true })
      .find(({ tagName: tn }) => tn === tagName);

    if (!customElementInfo) {
      throw new Error(`Unable to get quickinfo for unknown custom element: "${tagName}"`);
    }

    const { className, superclassName, description } = customElementInfo;

    let documentation: QuickInfo['documentation'] = [];
    if (description) {
      documentation.push({ kind: 'text', text: '\n' + description });
    }
    documentation = documentation.concat(
      this.services.customElements
        .getCEAttributes(tagName)
        .filter(({ deprecated }) => !deprecated)
        .map(({ name, type }, i) => ({
          kind: 'text',
          text: (i === 0 ? '\n\nAttributes:' : '') + `\n${name} \`${type}\``,
        }))
    );
    documentation = documentation.concat(
      this.services.customElements.getCEEvents(tagName).map(({ name }, i) => ({
        kind: 'text',
        text: (i === 0 ? '\n\nEvents:' : '') + `\n${name}`,
      }))
    );
    documentation = documentation.concat(
      this.services.customElements
        .getCEMembers(tagName)
        .filter(({ deprecated, privacy = 'public' }) => !(deprecated || privacy !== 'public'))
        .map(({ name, type, isStatic }, i) => ({
          kind: '[property]',
          text:
            (i === 0 ? '\n\nProperties:' : '') +
            `\n${name} \`${type}\`${isStatic ? ' (static) ' : ''}`,
        }))
    );

    return {
      textSpan: tokenSpan,
      kind: ScriptElementKind.classElement,
      kindModifiers: 'declare',
      displayParts: [
        { kind: 'text', text: `CustomElement declaration \`${tagName}\` ` },
        {
          kind: 'text',
          text: `\n(definition) export class ${className}${
            superclassName ? ' extends ' + superclassName : ''
          }`,
        },
      ],
      documentation,
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
      throw new Error("Couldn't find path for custom element with tagName: " + tagName);
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
