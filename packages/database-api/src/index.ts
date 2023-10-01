const api = require('./DatabaseController');

console.log('Database Api log', Object.keys(api));

const test = () => 'test-string';

module.exports = {
    DatabaseController: api.DatabaseController,
    test,
};
