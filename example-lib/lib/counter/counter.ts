import { attr, FASTElement, observable } from '@microsoft/fast-element';

export class Counter extends FASTElement {
  @observable public count: number = 0;

  /** The text to display on the counter button */
  @attr({ attribute: 'display-text' }) displayText: string | undefined;

  increment() {
    this.count += 1;
  }

  connectedCallback(): void {
    super.connectedCallback();
    console.log('Counter connectedCallback()');
  }
}
