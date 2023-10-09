import { registerComponents } from './components';

const app = document.querySelector<HTMLDivElement>('#app')!;

registerComponents();

app.innerHTML = `<root-component></root-component>`;
