import 'katex/dist/katex.min.css';
import './style.css';
import './objects';
import { App } from './app';

const app = new App(document.getElementById('app')!);
if (import.meta.env.DEV) (window as unknown as { __app: App }).__app = app;
