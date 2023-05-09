import { html, ref } from "@microsoft/fast-element";
import { ThemePicker } from "./theme";

export const themeTemplate = html<ThemePicker>`
  <template>
    <div class="fg">
      <input
        type="text"
        value="${(x) => `#${x.foreground}`}"
        ${ref("fgInput")}
      />
      <button @click="${(x) => x.updateTheme("foreground")}">Foreground</button>
    </div>

    <div class="bg">
      <input
        type="text"
        value="${(x) => `#${x.background}`}"
        ${ref("bgInput")}
      />
      <button @click="${(x) => x.updateTheme("background")}">Background</button>
    </div>
  </template>
`;
