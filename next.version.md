## mock.image
图片toDataUrl(canvas)

## mock.date
日期 format

## mock.email
邮箱

## mock.name
姓名 中英文

## mock.hash
hash值

## mock.tel
固话或手机号

## mock.sex
性别

## mock.idCard
身份证

## mock.zipCode
邮编

## mock.link
关联，比如mock.name关联mock.email, mock.idCard关联mock.sex和mock.zipCode
思考：
    mock.email、mock.sex、mock.zipCode返回mock
    eg: mock.object({
        name: mock.name(),
        email: mock.email().link('name')    //https://www.npmjs.com/package/pinyin + @server.com/cn....
    })
    
    
### version 3

mock本身不实现server功能，但是对外提供接口，example:
```javascript
let http = request('http');
http.createServer((req, res) => {
    res.end(mock(req)); 
}).listen(4200);
```

要不要添加缓存功能？？通过url缓存数据，用来删除，修改等。

——————要，实现上做个调整


//根据url, method 返回数据
eg:  mock('/user/login', 'post', mock.object({
    flag: true,
    messag: '登录成功'
}))

//获取数据后
eg: mock('/user/rights', 'get', mock.array({
    length: mock.random(5,10),
    item: mock.object({
        name: 'xxx',
        desc: 'xxxx'
    })
}))