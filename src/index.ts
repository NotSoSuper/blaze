const Dotenv = require('dotenv');

Dotenv.config({
    path: '.env',
});

import App from './App';

const port = process.env.PORT || 15001;
App.listen(port);
console.log(`Running on port ${port}`);
