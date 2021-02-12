import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { domReady } from './utils';
import init from './init.js';

domReady().then(() => init({ update: true }));
