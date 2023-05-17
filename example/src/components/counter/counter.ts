import { customElement } from "@microsoft/fast-element";
import { Counter, counterTemplate } from "example-lib";

@customElement({
  name: "example-counter",
  template: counterTemplate
})
export class ExampleCounter extends Counter { }
