const mock = require('./index');

let data = mock(mock.object({
    status: 2000,
    total: mock.size('list'),
    list: mock.array({
        length: mock.random(1, 2),
        item: mock.object({
            list: mock.array({
                length: mock.random(1,2),
                item: mock.object({
                    id: mock.index(2),
                    dd: mock.parent('id'),
                    xx: mock.text('parent name ', mock.parent(0, 'id')),
                })
            })
        })
    })
}));

let data2 = mock(mock.array({
    length: mock.random(5, 10),
    item: 'xx'
}));

console.log('data::',data2);