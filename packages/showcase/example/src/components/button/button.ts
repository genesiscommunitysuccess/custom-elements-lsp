import { attr } from '@microsoft/fast-element';
import { FoundationElement } from '@microsoft/fast-foundation';

/**
 * @tagname %%prefix%%-button
 */
export class CustomButton extends FoundationElement {
  @attr title: string = 'Default text';
}
