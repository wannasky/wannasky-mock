const _ = require('lodash'),
    ArrayManager = require('./lib/arrayManager');

const arrayManager = new ArrayManager();

const getUuid = function () {
    return Math.random().toString(32).split('.')[1];
}

//object转换成闭包函数返回
const transToFunc = function (object) {
    if (_.isFunction(object)) {
        return object;
    } else {
        return function () {
            return object;
        }
    }
}

/**
 * 解析字符串
 * @example mock.size('user.right.list')获取{user:{right:list:[]}} user.right.list的length
 * @param origin
 * @param mark
 * @returns {*|number}
 */
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
                return key.length || 0;
            }
        } else {
            return object.length || 0;
        }
    }
    return loop(origin, mark);
}

/**
 * 获取符合条件的节点树
 * @param object
 * @param condition
 * @returns {{}}
 */
const getDeepTree = (object, condition) => {
    let tree = {}, index = -1;
    let setTree = function (obj) {
        tree[++index] = obj;
    }
    let loop = function (obj) {
        if (condition(obj)) {
            return true;
        } else {
            if (_.isPlainObject(obj)) {
                let keys = Object.keys(obj), temp;
                for (let i = 0, l = keys.length; i < l; i++) {
                    temp = loop(obj[keys[i]]);
                    if (temp) {
                        setTree(obj);
                        break;
                    }
                }
                return temp;
            } else if (_.isArray(obj)) {
                let temp;
                for (let i = 0, l = obj.length; i < l; i++) {
                    temp = loop(obj[i]);
                    if (temp) {
                        setTree(obj);
                        break;
                    }
                }
                return temp;
            } else {
                return false;
            }
        }
    }
    loop(object);
    return tree;
}

/**
 * 获取指定parent深度的value
 * @param origin
 * @param id
 * @param deep
 * @param key
 * @returns {*}
 */
const getValue = function (origin, id, deep, key) {
    let tree = getDeepTree(origin, item => {
        return item.__id === id;
    });
    return tree[deep] ? tree[deep][key] : null;
}

/**
 * 依次查找fanction 并执行
 * @param object
 * @param origin
 * @returns {*}
 */
const findFuncAndExc = (object, origin) => {
    if (_.isPlainObject(object)) {
        let ret = {};
        for (let key in object) {
            ret[key] = findFuncAndExc(object[key], origin);
        }
        return ret;
    } else if (_.isArray(object)) {
        return object.map(item => {
            return findFuncAndExc(item, origin);
        })
    } else if (_.isFunction(object)) {
        if (object.__lazy && !origin) {
            return object;
        } else if (object.__lazy && origin) {
            return findFuncAndExc(object(origin), origin);
        } else {
            return findFuncAndExc(object(), origin);
        }
    } else {
        return object;
    }
}

/**
 * 检查是否是lazy
 * @param obj
 * @param {boolean} lazyTrue
 * @returns {*}
 */
const checkLazyFunc = (obj, lazyTrue) => {
    let check = (obj) => {
        if(obj.__lazy){
            return {
                __lazy: obj.__lazy,
                __id: obj.__id
            }
        }else{
            return false;
        }
    }
    if(_.isFunction(obj)){
        return check(obj);
    }else if(_.isArray(obj)){
        let arr = [],temp;
        obj.forEach(item => {
            temp = check(item);
            if(lazyTrue){
                if(temp) arr.push(temp);
            }else{
                arr.push(temp);
            }
        });
        return arr;
    }else{
        return false;
    }
}

//过滤内部使用的关键字
const filterCustomKey = function (object) {
    if (_.isPlainObject(object)) {
        for (let key in object) {
            object[key] = filterCustomKey(object[key]);
        }
        return object;
    } else if (_.isArray(object)) {
        object = object.filter(item => item !== '__end__' && item !== '__start__');
        return object.map(item => {
            return filterCustomKey(item);
        });
    } else {
        return object;
    }
}

/**
 *
 * @param template
 */
function mock(template) {
    let result = findFuncAndExc(template);
    result = filterCustomKey(result);

    result = findFuncAndExc(result, _.cloneDeep(result));
    return result;
}

/**
 * mock对象
 * @param object
 */
mock.object = function (object) {
    return transToFunc(object);
}

/**
 * mock 数组
 * @param object
 * @returns {Array}
 */
mock.array = function (object) {
    let length = findFuncAndExc(object.length);
    let arrayIndex, item = object.item, ret = [];
    ret.push(function () {
        arrayIndex = arrayManager.createIndex();
        return '__start__';
    });
    for (let i = 0; i < length; i++) {
        ret.push(function () {
            arrayIndex.add();
            return transToFunc(item);
        });
    }
    ret.push(function () {
        arrayManager.remove();
        return '__end__';
    })
    return ret;
}

mock.parent = function (...args) {
    if (!args.length) return '';
    let deep = 0, key = args[0];
    if (args.length !== 1) {
        deep = parseInt(args[0]);
        key = args[1];
    }
    let uuid = getUuid();
    let func = function (origin) {
        return origin ? getValue(origin, uuid, deep, key) : undefined;
    }
    func.__id = uuid;
    func.__lazy = true;
    return func;
}

/**
 * mock 文本
 * @param args
 * @returns {Function}
 */
mock.text = function (...args) {
    let lazys = checkLazyFunc(args, true);
    if (lazys.length) {
        //有多个延迟执行的func的话，因为在同一层级，任取一个含有__id即可作为mock.text的延迟标识__id
        let goodMatch = lazys.filter(item => item.__id);
        let __id = goodMatch.length ? goodMatch[0].__id : undefined;
        let argArray = [];
        for (let i = 0, l = args.length; i < l; i++) {
            argArray.push(args[i].__lazy ? args[i] : findFuncAndExc(args[i]));
        }
        let func = function (origin) {
            return argArray.reduce((pre, next) => {
                return findFuncAndExc(pre, origin) + '' + findFuncAndExc(next, origin);
            });
        }
        func.__id = __id;
        func.__lazy = true;
        return func;
    } else {
        return function () {
            return args.reduce((pre, next) => {
                return findFuncAndExc(pre) + '' + findFuncAndExc(next);
            });
        }
    }
}

/**
 * mock 数组索引
 * @param initIndex
 * @returns {Function}
 */
mock.index = function (initIndex = 0) {
    return function () {
        return initIndex + arrayManager.getDistance(0).index || 0;
    }
}

/**
 * mock的数组/字符长度
 * @param {string} mark 用法参见README.md
 * @returns {*}
 */
mock.size = function (mark) {
    if (!mark) return 0;
    let lazy = checkLazyFunc(mark);
    let lengthFunc = function (origin) {
        return origin ? getSize(origin, findFuncAndExc(mark, origin)) : (mark.length || 0);
    }
    lengthFunc.__lazy = true;
    lengthFunc.__id = lazy ? lazy.__id : undefined;
    return lengthFunc;
}

/**
 * mock 随机
 * @param args
 * @returns {*}
 */
mock.random = function (...args) {
    let isRunCompiler = args[args.length - 1];
    isRunCompiler = isRunCompiler && _.isBoolean(isRunCompiler);
    let compiler;
    if (_.isArray(args[0])) {
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