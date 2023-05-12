import { DesignSystem } from "@microsoft/fast-foundation";
import { Avatar } from "./components/avatar/avatar";
import { button } from "./components/button/button";
import { ThemePicker } from "./components/theme/theme";
import { RootComponent } from "./root";

function provideExampleDesignSystem(element?: HTMLElement): DesignSystem {
    return DesignSystem.getOrCreate(element).withPrefix("example");
}

export const registerComponents = () => {
  provideExampleDesignSystem().register(button());

  RootComponent;
  Avatar;
  ThemePicker;
};
