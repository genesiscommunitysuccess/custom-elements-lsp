import { html } from '@microsoft/fast-element';
import { CustomButton } from './button';

export const customButtonTemplate = html<CustomButton>`
  <button>${(x) => x.title}</button>
`;
