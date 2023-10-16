import { attr, customElement, FASTElement } from '@microsoft/fast-element';
import { themeStyles } from './theme.style';
import { themeTemplate } from './theme.template';

@customElement({
  name: 'theme-picker',
  template: themeTemplate,
  styles: themeStyles,
})
export class ThemePicker extends FASTElement {
  @attr foreground: string = '0078D4';
  @attr background: string = '808080';

  // @internal
  fgInput: HTMLInputElement | null = null;
  // @internal
  bgInput: HTMLInputElement | null = null;

  updateTheme(type: 'foreground' | 'background') {
    if (type === 'foreground') {
      this.foreground = '#' + this.fgInput?.value.replace(/#/g, '') ?? '808080';
      console.log(this.foreground);
      if (/#[A-Fa-f0-9]{6}/.test(this.foreground)) {
        document.body.style.setProperty('--accent-color', this.foreground);
      }
    }

    if (type === 'background') {
      this.background = '#' + this.bgInput?.value.replace(/#/g, '') ?? '808080';
      console.log(this.background);
      if (/#[A-Fa-f0-9]{6}/.test(this.background)) {
        document.body.style.setProperty('--neutral-color', this.background);
      }
    }
  }
}
