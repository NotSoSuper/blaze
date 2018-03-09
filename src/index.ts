const Dotenv = require('dotenv');

Dotenv.config({
    path: '.env',
});

import * as ErrorHandler from 'errorhandler';
import App from './App';

App.use(ErrorHandler());

const server = App.listen(App.get('port'), () => {
    console.log(`Server running on port ${App.get('port')}`);
});

export default server;
