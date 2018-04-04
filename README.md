## @wannasky/mock

一个自动化的数据生成器

### mock.array

定义一个数组

```javascript
mock.array({
    length: mock.random(10, 20),
    item: mock.object({
        id: mock.index,
        name: mock.text('name-', mock.index)
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
        text: 'message'
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
         name: mock.text('wannasky-', mock.index),
         age: mock.random(20, 30, true)  //看这里
      })

    })
})
```

### mock.index
获取当前array的index值， 从 1 开始

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

### mock.size
获取指定array的长度
```javascript
mock.object({
    status: 2000,
    total: mock.size('user.rights'),
    user: mock.object({
        name: 'wannasky',
        rights: mock.array({
            length: mock.random(5, 15),
            item: mock.array({
                name: 'xxxxx'
            })
        })
    })
})
```