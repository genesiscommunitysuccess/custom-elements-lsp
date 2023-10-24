import { MyElement as ParentElement } from 'my-library';

export class MyElement extends ParentElement {
  baz = 'qix';
}

export class AnotherElement extends HTMLElement {
  a = 'b';
}
