## @wannasky/mock

一个自动化的动态数组生成器

### 使用mock缓存优化请求

mock第一个参数为request对象（有url和method）,或者第一第二个参数为字符串，自己指定url和method

当指定url和method后，mock会缓存mock产生的数据，第二次在调用时直接从缓存返回。

另外可通过mock.cache(url, method[, next, rewrite])来获取缓存的数据，用于做增删改查；next可用来过滤或者修改从缓存中提取的数据; rewrite用来指定是否重写缓存

example：

```javascript
    let app = express();

    //获取列表数据
    app.get('/list',(req, res) => {
        res.json(mock(req, mock.object({   // mock(req, mock.object)、mock('/list', 'get', mock.object)
            status: 2000,
            list: mock.array({
                length: mock.random(5, 10),
                item: mock.object({
                    name: mock.text('name-', mock.index),
                    age: mock.random(15, 35, true)
                })
            })
        })))
    });

    //更新列表数据
    app.put('/list', (req, res) => {
        let index = req.param('index');
        let newData = mock.cache('/list', 'get', data => {
            data.list[index].name = 'new-name';
        }, true); // 这里的true用于更新缓存
        res.json(newData);
    });

```



### mock.array

定义一个数组

```javascript
mock.array({
    length: mock.random(10, 20),
    item: mock.object({
        id: mock.index,
        name: mock.text('name-', mock.index(1), '-customer')
    })
})
```

### mock.object

定义一个对象

```javascript
mock.object({
    status: 200,
    result: mock.array({
        length: 20,
        item: 'message'
    })
})
```

### mock.random

随机变量生成器

+ mock.random(10, 20)

    返回[10, 20)随机一个整数
    
+ mock.random([true, false, 1, 2, 3])

    返回[true, false, 1, 2 , 3]中任意一个
    
+ mock.random([true, false, 1, 2, 3], true)
最后一个参数如果为true Boolean类型的！！！那么会在运行中随机，而不是初始化时随机，多用于在mock.array内部

```javascript
mock.object({
   status: 2000,
   total: mock.size('list'),
   list: mock.array({
      length: 20,
      item: mock.object({
         id: mock.index(1),
         name: mock.text('wannasky-', mock.index),
         age: mock.random(20, 30, true)  //看这里
      })

    })
})
```

### mock.index(initIndex = 0)
获取当前array的index值， 默认initIndex=0 从0开始计数
```javascript
mock.array({
    length: 5,
    item: mock.object({
        id: mock.index,
        start: mock.index(1)
    })
})
```

### mock.text
生成自定义文本
```javascript
mock.array({
    length: mock.random(10, 30),
    item: mock.object({
        text: mock.text('name-', mock.index, '-after')
    })
})
```

### mock.size(mark)
mock类型有：字符串（数组的名称）、function
获取指定array的长度，如果不存在则返回mark的长度
```javascript
mock.object({
    status: 2000,
    total: mock.size('user.rights'),    //可以这么用
    user: mock.object({
        name: 'wannasky',
        rights: mock.array({
            length: mock.random(5, 15),
            item: mock.array({
                id: mock.text('pre-', mock.index, '-xx'),
                name: 'xxxxx',
                idLength: mock.size(mock.parent('id')),  //还可以这么用
            })
        })
    })
})
```

### mock.parent(deep=0, key)
以当前所在位置获取parent的属性值,deep默认为0，即当前所在对象
```javascript
mock.object({
    status: 2000,
    total: mock.size('user.rights'),
    list: mock.array({
        length: mock.random(5, 10),
        item: mock.object({
            id: mock.index(1),
            total: mock.parent(2, 'total'),  //当前对象（mock.object 0） => 数组(mock.array 1) => 对象(mock.object 2)(即total所在的对象)
            idLength: mock.size(mock.parent('id')),  //还可以这么用
            lengthText: mock.text('length:', mock.parent('idLength')) //甚至这么用
        })
    })
})
```

### mock.cache(url, method, next, rewrite)
用于操作缓存， next用于编辑从缓存获取的数据， rewrite用于指定是否用next的返回值重写此缓存