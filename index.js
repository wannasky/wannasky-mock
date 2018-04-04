const isObject = function (object) {
    return Object.prototype.toString.call(object) === '[object Object]';
}

const isFunction = function (object) {
    return Object.prototype.toString.call(object) === '[object Function]';
}

const isBoolean = function (object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
}

const objectFormat = function (target) {
    return target;
}

const transFunction = function (object) {
    if (isFunction(object)) {
        return object;
    } else {
        return function () {
            return objectFormat(object);
        }
    }
}

const getSize = function (origin, mark) {
    let loop = function (object, key) {
        let keys = key.split('.');
        if (keys.length) {
            key = keys.shift();
            if (object.hasOwnProperty(key)) {
                if (keys.length) {
                    return loop(object[key], keys.join('.'));
                } else {
                    return object[key].length;
                }
            } else {
                return 0;
            }
        } else {
            return object.length || 0;
        }
    }
    return loop(origin, mark);
}

const findFunctionAndExecute = function (object, origin) {
    if (isObject(object)) {
        let ret = {};
        for (let key in object) {
            ret[key] = findFunctionAndExecute(object[key], origin);
        }
        return ret;
    } else if (Array.isArray(object)) {
        return object.map(item => {
            return findFunctionAndExecute(item, origin);
        })
    } else if (isFunction(object)) {
        if (object.__lazy && !origin) {
            return object;
        } else if (object.__lazy && origin) {
            return findFunctionAndExecute(object(origin), origin);
        } else {
            return findFunctionAndExecute(object(), origin);
        }
    } else {
        return object;
    }
}

const executeExpress = function (express) {
    return isFunction(express) ? express() : express;
}

const filterCustomKey = function (object) {
    if (isObject(object)) {
        for (let key in object) {
            object[key] = filterCustomKey(object[key]);
        }
        return object;
    } else if (Array.isArray(object)) {
        object = object.filter(item => item !== '__end__' && item !== '__start__');
        return object.map(item => {
            return filterCustomKey(item);
        });
    } else {
        return object;
    }
}


function mock(template) {
    let result = findFunctionAndExecute(template);
    result = filterCustomKey(result);
    result = findFunctionAndExecute(result, JSON.parse(JSON.stringify(result)));
    return result;
}

mock.object = function (object) {
    return transFunction(object);
}

class ArrayIndex {

    constructor() {
        this.index = 0;
    }

    add() {
        this.index = this.index + 1;
    }
}

class ArrayIndexManager {

    constructor() {
        this.__store = [];
    }

    getDistance(distance) {
        //TODO: 添加distance支持
        return this.__store[this.__store.length - 1];
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

let indexManager = new ArrayIndexManager();


mock.array = function (object) {
    let length = object.length;

    let arrayIndex;

    if (isFunction(length)) {
        length = findFunctionAndExecute(length);
    }

    let item = object.item;

    let ret = [];
    ret.push(function () {
        arrayIndex = indexManager.createIndex();
        return '__start__';
    });
    for (let i = 0; i < length; i++) {
        ret.push(function () {
            arrayIndex.add();
            return transFunction(item);
        });
    }
    ret.push(function () {
        indexManager.remove();
        return '__end__';
    })
    return ret;
}

mock.text = function (...args) {
    return function () {
        return args.reduce((pre, next) => {
            return executeExpress(pre) + '' + executeExpress(next);
        });
    }
}

mock.index = function () {
    return indexManager.getDistance(0).index;
}

mock.size = function (mark) {
    if (!mark) return 0;
    let lengthFunc = function (origin) {
        return origin ? getSize(origin, mark) : 0;
    }
    lengthFunc.__lazy = true;
    return lengthFunc;
}

mock.random = function () {
    let args = [].slice.call(arguments);
    let isRunCompiler = args[args.length - 1];
    isRunCompiler = isRunCompiler && isBoolean(isRunCompiler);
    let compiler;
    if (Array.isArray(args[0])) {
        compiler = function () {
            return args[0][Math.floor(Math.random() * args[0].length)];
        }
    } else {
        compiler = function () {
            let min = parseInt(args[0]);
            let max = parseInt(args[1]);
            let dlta = Math.floor(Math.random() * (max - min));
            return min + dlta;
        }
    }
    return isRunCompiler ? compiler : compiler();
}

module.exports = mock;