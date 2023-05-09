import { getCEManifest, getLogger, html } from "../../jest/utils";
import { CompletionsService } from "./completions";

const getCompletionsService = () =>
  new CompletionsService(getLogger(), getCEManifest());

describe("getComletionType", () => {
  it("Returns key none if not match is found", () => {
    const service = getCompletionsService();
    const context = html``;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 0,
    });

    expect(completions.entries).toHaveLength(0);
  });

  /*
  it("Returns key XXXXX if no match is found", () => {
    const service = getCompletionsService();

    const context = html`
      <template>
        <div class="fg">
          <input type="text" value="${(x) => `#${x.foreground}`}" />
          <button @click="${(x) => x.updateTheme("foreground")}">
            Foreground
          </button>
        </div>

        <div class="bg">
          <input type="text" value="${(x) => `#${x.background}`}" />
          <button @click="${(x) => x.updateTheme("background")}">
            Background
          </button>
        </div>
      </template>
    `;

    console.log(context.text);
    console.log(context.rawText);

    // TODO: Finish
  });
  */
});
