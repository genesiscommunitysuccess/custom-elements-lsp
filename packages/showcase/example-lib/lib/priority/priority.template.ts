import { html } from '@microsoft/fast-element';
import { PrioritySelector, priorityTypes } from './priority';

const defaultText = 'Update';

export const prioritySelectorTemplate = html<PrioritySelector>`
  <template>
    <div>Priority : ${(x) => priorityTypes[x.count]}.</div>
    <button @click=${(x) => x.increment()}>${(x) => x.displayText ?? defaultText}</button>
  </template>
`;
