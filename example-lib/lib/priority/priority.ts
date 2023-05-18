import { customElement } from "@microsoft/fast-element";
import { Counter } from "../counter";

// Contrived inheritance example

export const priorityTypes = ["low", "medium", "high"] as const;

@customElement({
  name: "priority-selector"
})
export class PrioritySelector extends Counter {

  override increment() {
    super.increment();
    if (this.count >= priorityTypes.length) {
      this.count = 0;
    }
  }
}
