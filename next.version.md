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