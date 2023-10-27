import { MyElement as ParentElement } from 'my-library';

export class MyElement extends ParentElement {
  baz = 'qix';
}

export class GrandchildElement extends MyElement {}

export class AnotherElement extends HTMLElement {
  a = 'b';
}
