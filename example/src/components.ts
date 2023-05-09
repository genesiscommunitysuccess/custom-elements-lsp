import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { Avatar } from "./components/avatar/avatar";
import { ThemePicker } from "./components/theme/theme";
import { RootComponent } from "./root";

export const registerComponents = () => {
  provideFASTDesignSystem().register();

  RootComponent;
  Avatar;
  ThemePicker;
};
