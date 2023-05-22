import {
  customElement,
  FASTElement,
  html,
  observable,
} from "@microsoft/fast-element";
import { Avatar } from "./components/avatar/avatar";

const rootTemplate = html`
  <template @avatar-selected=${(x, c) => x.avatarSelected(c.event)}>
    <theme-picker background="FFFFFF" background="000000"></theme-picker>

    <h1>
      ${(x) =>
    x.selectedAvatarName ? `Selected: ${x.selectedAvatarName}` : ""}
    </h1>

    <person-avatar fullInfoDisabled>
      <h1 slot="title">Matt</h1>
    </person-avatar>

    <person-avatar></person-avatar>

    <person-avatar fullInfoDisabled invalidAttr>
      <h1 slot="title">Full info disabled</h1>
    </person-avatar>

    <invalid-component></invalid-component>

    <example-counter></example-counter>

    <example-counter display-text="Reverse" reverse></example-counter>

    <priority-selector></priority-selector>
  </template>
`;

@customElement({
  name: "root-component",
  template: rootTemplate,
})
export class RootComponent extends FASTElement {
  @observable selectedAvatarName?: string;

  avatarSelected(e: CustomEvent<Avatar>) {
    const avatarTitle =
      e.detail.querySelector("h1")?.textContent ??
      e.detail.shadowRoot?.querySelector("h1")?.textContent ??
      "Unknown";

    this.selectedAvatarName = avatarTitle;
  }
}
