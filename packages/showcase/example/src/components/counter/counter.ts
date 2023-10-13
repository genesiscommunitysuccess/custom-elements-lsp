import { Counter, counterTemplate } from '@genesiscommunitysuccess/example-lib';
import { attr, customElement } from '@microsoft/fast-element';

Counter;

@customElement({
  name: 'example-counter',
  template: counterTemplate,
})
export class ExampleCounter extends Counter {
  /** Counter will decrement if set */
  @attr({ mode: 'boolean' }) reverse = false;

  override increment(): void {
    this.count += this.reverse ? -1 : 1;
  }

  connectedCallback(): void {
    super.connectedCallback();
    console.log('ExampleCounter connectedCallback()');
  }
}
