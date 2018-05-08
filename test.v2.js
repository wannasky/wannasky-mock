const mock = require('./index');

/**
 * @url /test
 * @method get
 */
let data = mock('/test', 'get', mock.object({
    status: 2000,
    objects: {
        name: 'wannasky',
        age: mock.random(5, 10, true)
    }
}));

/**
 * update
 */
let data2 = mock.cache('/test', 'get', data => {
    data.objects.name = 'ws';
    return data;
}, true);

let data3 = mock.cache('/test', 'get');


console.log(data, data2, data3);



