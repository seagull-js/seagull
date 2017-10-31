import { render } from 'react-dom';
import Routing from './routing'

// client side (browser) entry for loading our seagull app
render(new Routing().load(), document.getElementById('root'))