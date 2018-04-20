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
                    name: mock.parent('id'),
                    email: mock.email().link('name'), //next version support
                    idcard: mock.idCard(), //next version support
                    sex: mock.sex().link('idcard'),  //next version support
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