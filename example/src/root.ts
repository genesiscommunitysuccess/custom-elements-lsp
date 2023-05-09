import { customElement, FASTElement, html } from "@microsoft/fast-element";

const rootTemplate = html`
  <template>
    <theme-picker background="FFFFFF" background="000000"></theme-picker>

    <person-avatar fullInfoDisabled>
      <h1 slot="title">Matt</h1>
    </person-avatar>

    <person-avatar></person-avatar>

    <person-avatar fullInfoDisabled invalidAttr>
      <h1 slot="title">Full info disabled</h1>
    </person-avatar>

    <invalid-component></invalid-component>
  </template>
`;

@customElement({
  name: "root-component",
  template: rootTemplate,
})
export class RootComponent extends FASTElement {}
