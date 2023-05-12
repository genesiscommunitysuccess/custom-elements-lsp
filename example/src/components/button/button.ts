import { attr } from "@microsoft/fast-element";
import { FoundationElement } from "@microsoft/fast-foundation";
import { customButtonStyles } from "./button.style";
import { customButtonTemplate } from "./button.template";

export class CustomButton extends FoundationElement {
  @attr title: string = "Default text";
}

export const button = CustomButton.compose({
  baseName: "button",
  template: customButtonTemplate,
  styles: customButtonStyles,
});
