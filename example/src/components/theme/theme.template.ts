import { html, ref } from '@microsoft/fast-element';
import { ThemePicker } from './theme';

export const themeTemplate = html<ThemePicker>`
  <template>
    <div class="fg">
      <input type="text" value="${(x) => `#${x.foreground}`}" ${ref('fgInput')} />
      <example-button
        @click="${(x) => x.updateTheme('foreground')}"
        title="Foreground"
      ></example-button>
    </div>

    <div class="bg">
      <input type="text" value="${(x) => `#${x.background}`}" ${ref('bgInput')} />
      <example-button @click="${(x) => x.updateTheme('background')}" title="Background">
        Background
      </example-button>
    </div>
  </template>
`;
