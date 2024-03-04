import './popup.css';
import './view/view.js';
import { registerAllHandlers } from './handler/handlerRegister.js';
import { renderAll } from './view/view.js';

console.log("Hello PMCA!");
await renderAll();
registerAllHandlers();