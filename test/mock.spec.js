const {assert} = require('chai');

const mock = require('../index');

describe('mock简单测试', () => {

    let data = mock(mock.object({
        status: 2000,
        total: mock.size('list'),
        list: mock.array({
            length: mock.random(5, 10),
            item: mock.object({
                name: mock.text('name-', mock.index),
                price: mock.random(100, 1000, true),
                invoice: mock.random([true, false], true),
                parentStatus: mock.parent(2, 'status')
            })
        })
    }));

    it('#mock.array()', () => {
        assert.typeOf(data.list, 'array');
    });

    it('#mock.object()', () => {
        assert.typeOf(data.list[0], 'object');
    });

    it('#mock.size()', () => {
        assert.equal(data.total, data.list.length);
    });

    it('#mock.text()', () => {
        assert.include(data.list[0].name, 'name-');
    });

    it('#mock.random()', () => {
        assert.isAtMost(100, data.list[0].price);
        assert.isBelow(data.list[0].price, 1000);
        assert.isBoolean(data.list[0].invoice);
        assert.isBoolean(data.list[0].invoice);
    });

    it('#mock.parent()', () => {
        assert.equal(data.status,data.list[0].parentStatus);
    });
})