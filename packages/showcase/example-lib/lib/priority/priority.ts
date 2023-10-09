import { customElement } from '@microsoft/fast-element';
import { Counter } from '../counter';
import { prioritySelectorTemplate } from './priority.template';

// Contrived inheritance example

export const priorityTypes = ['low', 'medium', 'high'] as const;

@customElement({
  name: 'priority-selector',
  template: prioritySelectorTemplate,
})
export class PrioritySelector extends Counter {
  override increment() {
    super.increment();
    if (this.count >= priorityTypes.length) {
      this.count = 0;
    }
  }
}
