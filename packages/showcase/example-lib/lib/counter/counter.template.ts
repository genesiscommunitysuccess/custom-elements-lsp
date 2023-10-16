import { html } from '@microsoft/fast-element';
import { Counter } from './counter';

const defaultText = 'Counter';

export const counterTemplate = html<Counter>`
  <template>
    <div>The count is ${(x) => x.count}.</div>
    <button @click=${(x) => x.increment()}>${(x) => x.displayText ?? defaultText}</button>
  </template>
`;
