import { html } from "@microsoft/fast-element";
import { Counter } from "./counter";

export const counterTemplate = html<Counter>`
  <div>The count is ${(x) => x.count}.</div>
  <button @click=${(x) => x.increment()}></button>
`;
