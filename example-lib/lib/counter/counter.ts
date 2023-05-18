import {
  attr,
  customElement,
  FASTElement,
  observable,
} from "@microsoft/fast-element";
import { FoundationElement } from "@microsoft/fast-foundation";
import { counterTemplate } from "./counter.template";


export class Counter extends FASTElement {
  @observable public count: number = 0;

  /** The text to display on the counter button */
  @attr({ attribute: "display-text" }) displayText: string | undefined;

  increment() {
    this.count++;
  }

  connectedCallback(): void {
    super.connectedCallback();
    console.log("Counter connectedCallback()");
  }
}

// export class Counter extends FoundationElement {
// @observable public count: number = 0;
//
// /** The text to display on the counter button */
// @attr({ attribute: "display-text" }) displayText: string | undefined;
//
// increment() {
// this.count++;
// }
//
// connectedCallback(): void {
// super.connectedCallback();
// console.log("Counter connectedCallback()");
// }
// }

// export const counter = Counter.compose({
// baseName: "counter",
// template: counterTemplate,
// });
