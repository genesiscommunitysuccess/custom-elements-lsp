import { attr, customElement, FASTElement, observable } from "@microsoft/fast-element";
import { Counter, counterTemplate } from "example-lib";

// export class Counter extends FASTElement {
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

Counter;

@customElement({
  name: "example-counter",
  template: counterTemplate,
})
export class ExampleCounter extends Counter {
  /** Counter will decrement if set */
  @attr({ mode: "boolean" }) reverse = false;

  override increment(): void {
    this.count += this.reverse ? -1 : 1;
  }

  connectedCallback(): void {
    super.connectedCallback();
    console.log("ExampleCounter connectedCallback()");
  }
}

// export class ExampleCounter extends Counter {
// /** Counter will decrement if set */
// @attr({ mode: "boolean" }) reverse = false;
//
// override increment(): void {
// this.count += this.reverse ? -1 : 1;
// }
//
// connectedCallback(): void {
// super.connectedCallback();
// console.log("ExampleCounter connectedCallback()");
// }
// }
//
// export const exampleCounter = ExampleCounter.compose({
// baseName: "counter",
// template: counterTemplate,
// });
