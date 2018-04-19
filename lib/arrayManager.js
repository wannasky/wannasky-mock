/**
 * 数组下标
 * 从0开始计数
 */
class ArrayIndex {

    constructor() {
        this.index = -1;
    }

    add() {
        this.index = this.index + 1;
    }
}

/**
 * 数组管理
 */
class ArrayManager {

    constructor() {
        this.__store = [];
    }

    getDistance(distance = 0) {
        //TODO: 添加distance支持
        let index = this.__store.length - 1;
        return this.__store[index] || {};
    }

    createIndex() {
        let arrayIndex = new ArrayIndex();
        this.__store.push(arrayIndex);
        return arrayIndex;
    }

    remove() {
        this.__store.pop();
    }
}

module.exports = ArrayManager;