import { customElement, FASTElement, html, observable } from '@microsoft/fast-element';
import { attrSrc, Avatar, propertySrc } from './components/avatar/avatar';

const rootTemplate = html`
  <template @avatar-selected=${(x, c) => x.avatarSelected(c.event)}>
    <theme-picker background="FFFFFF" background="000000"></theme-picker>

    <h1 id="test" habbotel="" id="">
      ${(x) => (x.selectedAvatarName ? `Selected: ${x.selectedAvatarName}` : '')}
    </h1>

    <person-avatar
      id="test"
      aria-label="person"
      data-test-id="${(_) => 'test_id'}"
      @avatar-selected="${(x, c) => 'test'}"
    >
      <h1 slot="title">Matt</h1>
    </person-avatar>

    <person-avatar
      :avatarSrc="${(_) => propertySrc}"
      avatar-src="${(_) => attrSrc}"
      :curry=${(_) => 'curry'}
    ></person-avatar>

    <priority-selector></priority-selector>

    <person-avatar
      ?fullInfoDisabled="${(_) => true}"
      invalidAttr
      invalidAttr
      invalidAttr
      invalidAttr
      invalidAttr
      unused
    >
      <h1 slot="title">Full info disabled</h1>
    </person-avatar>

    <invalid-component></invalid-component>

    <example-counter></example-counter>

    <example-counter display-text="Reverse" reverse></example-counter>

    <priority-selector></priority-selector>

    <banana></banana>
    <caption align="" data-test="${(x) => true}"></caption>
    <video loop="true"></video>

    <div wololo="test" wolo="also-fail"></div>
  </template>
`;

@customElement({
  name: 'root-component',
  template: rootTemplate,
})
export class RootComponent extends FASTElement {
  @observable selectedAvatarName?: string;

  avatarSelected(e: CustomEvent<Avatar>) {
    const avatarTitle =
      e.detail.querySelector('h1')?.textContent ??
      e.detail.shadowRoot?.querySelector('h1')?.textContent ??
      'Unknown';

    this.selectedAvatarName = avatarTitle;
  }
}
