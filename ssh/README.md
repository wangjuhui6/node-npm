# node 服务器操作

### 安装
npm i @wjh666/ssh -g

### 已有命令
w-ssh upFile

### upFile
上传文件到服务器，用于前端项目部署，本地打包后读取配置文件，根据配置文件信息，上传到服务器
项目根目录添加配置文件
文件命名格式：up-file.js up-file.**.js
文件内容事例
```javascript
module.exports = {
  host: '', // 服务器地址
  port: '', // 端口
  username: '', // 帐号
  password: '', // 密码
  localDir: './dist', // 要上传的文件地址（相对路径）
  serverDir: '/data/demo01' // 要上传到服务器的目录
}
```
