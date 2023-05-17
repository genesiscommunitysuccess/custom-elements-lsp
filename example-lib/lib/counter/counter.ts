import {
  customElement,
  FASTElement,
  observable,
} from "@microsoft/fast-element";
import { counterTemplate } from "./counter.template";

@customElement({
  name: "lib-counter",
  template: counterTemplate,
})
export class Counter extends FASTElement {
  @observable public count: number = 0;

  public increment() {
    this.count++;
  }
}
