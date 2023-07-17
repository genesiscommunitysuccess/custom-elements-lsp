/* eslint-disable */

/**
 * This file contains test cases which need to be in a specific shape (whitespace and new lines) to test
 * what they're supposed to test. Because formatters for IDEs like prettier and VSCode will change the
 * format of the file, we need to store them in a separate file and import them into the test. Otherwise
 * every time the file is formatted, the test will fail.
 *
 * You should not run a formatter in this file
 */
import { html } from './utils';

export const STRINGS__TOKEN_TYPE_empty_attr = html`
  <person-avatar id="" @click="${(x, c) => true}" ></person-avatar>
`;

export const STRINGS__TEXT_REPLACEMENT_SPAN_no_preceding_whitespace = html`testagain`;
