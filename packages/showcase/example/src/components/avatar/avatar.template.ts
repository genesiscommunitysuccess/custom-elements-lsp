import { html, when } from '@microsoft/fast-element';
import { Avatar } from './avatar';

const placeholder = `
Laborum a cupiditate aperiam eum eum aliquam. Enim rerum ut voluptatem quo consequatur quia. Molestiae odio autem deleniti quasi dolorem omnis nam vel. Eum qui qui commodi. Nihil in tempora sit voluptatem sed repudiandae sapiente excepturi. Repudiandae tempora voluptates voluptas ex rerum.
`;

export const avatarTemplate = html<Avatar>`
  <template>
    <div class="container" @click="${(x) => x.avatarSelected()}">
      <div class="top">
        <img
          src="${(x) => x.avatarSrc}"
          @click="${(x, c) => (x.showFullInfo = !x.showFullInfo)})}"
        />
        <div>
          <slot name="title">
            <h1>Placeholder</h1>
          </slot>
          <slot name="address">
            <p>123 London Road</p>
            <p>PA 112</p>
          </slot>
        </div>
      </div>

      ${when(
        (x) => x.showFullInfo && !x.fullInfoDisabled,
        html`
          <div class="bottom">
            <slot name="info">
              <p>${(_) => placeholder}</p>
            </slot>
          </div>
        `,
      )}
    </div>
  </template>
`;
