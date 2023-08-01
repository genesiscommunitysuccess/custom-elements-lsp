import { allComponents, fastCombobox } from '@microsoft/fast-components';
import { DesignSystem } from '@microsoft/fast-foundation';
import { PrioritySelector } from 'example-lib';
import { Avatar } from './components/avatar/avatar';
import { button } from './components/button/button.declaration';
import { ExampleCounter } from './components/counter/counter';
import { ThemePicker } from './components/theme/theme';
import { RootComponent } from './root';

function provideExampleDesignSystem(element?: HTMLElement): DesignSystem {
  return DesignSystem.getOrCreate(element).withPrefix('example');
}

export const registerComponents = () => {
  provideExampleDesignSystem().register(button(), allComponents);



  RootComponent;
  Avatar;
  ThemePicker;
  ExampleCounter;
  PrioritySelector;
};
