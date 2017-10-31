import { render } from 'react-dom';
import Routing from './routing'

render(new Routing().load(), document.getElementById('root'))