import { CustomButton } from './button';
import { customButtonStyles } from './button.style';
import { customButtonTemplate } from './button.template';

export const button = CustomButton.compose({
  baseName: 'button',
  template: customButtonTemplate,
  styles: customButtonStyles,
});
