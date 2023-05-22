import {
  attr,
  customElement,
  FASTElement,
  html,
  observable,
} from "@microsoft/fast-element";
import { avatarStyles } from "./avatar.styles";
import { avatarTemplate } from "./avatar.template";

const defaultAvatarSrc =
  "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light";

/**
 * Avatar class to display information about a person.
 * @remarks
 * Intractable to show extra information, configurable via attributes.
 * @privateRemarks
 * Coloured based on the `design system` css variables.
 * @fires "avatar-selected" on click with the avatar element as the detail.
 */
@customElement({
  name: "person-avatar",
  template: avatarTemplate,
  styles: avatarStyles,
})
export class Avatar extends FASTElement {
  /** Boolean attribute to show/hide the full info section. */
  @observable showFullInfo = false;
  /** String is the `img` src to show for the avatar. Defaulted to `avataaars.io` */
  @attr({ attribute: "avatar-src" }) avatarSrc: string = defaultAvatarSrc;
  /** Boolean attribute to disable the full info section entirely. */
  @attr({ mode: "boolean" }) fullInfoDisabled: boolean = false;

  avatarSelected() {
    this.$emit("avatar-selected", this);
  }
}
