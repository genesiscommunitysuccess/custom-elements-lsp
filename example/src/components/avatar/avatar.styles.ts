import { css } from '@microsoft/fast-element';

export const avatarStyles = css`
  :host {
    margin: 10px;
  }

  div.container {
    background-color: var(--accent-color);
  }

  div.top {
    width: 80%;
    flex: auo;
    display: grid;
    grid-auto-columns: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
  }
`;
