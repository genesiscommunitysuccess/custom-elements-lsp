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

@customElement({
  name: "person-avatar",
  template: avatarTemplate,
  styles: avatarStyles,
})
export class Avatar extends FASTElement {
  @observable showFullInfo = false;
  @attr({ attribute: "avatar-src" }) avatarSrc: string = defaultAvatarSrc;
  @attr({mode: "boolean"}) fullInfoDisabled: boolean = false;
}

