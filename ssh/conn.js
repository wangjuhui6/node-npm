const path = require('path')
const fs = require('fs')
const { Client } = require('ssh2')
const conn = new Client();

let localDir = ''
let serverDir = ''

// 获取目录
async function getSftp (sftp) {
  return new Promise(((resolve, reject) => {
    sftp.readdir(serverDir, (err, list) => {
      if (err) {
        return resolve(false)
      }
      resolve(list)
    });
  }))
}

// 备份儿目录
async function renameSftp (sftp) {
  sftp.rename(serverDir, serverDir + new Date().getTime())
}

// 拼接文件夹名称
function jsonFileName (filesName, pathName = '/') {
  let fileData = [{
    name: pathName,
    type: 'files'
  }]
  for (const i in fs.readdirSync(filesName)) {
    const val = fs.readdirSync(filesName)[i]
    const name = path.join(filesName, val)
    const newPathName = path.join(pathName, val)
    const fileText = fs.lstatSync(name)
    if (fileText.isFile()) {
      fileData.push({
        name: newPathName,
        type: 'file'
      })
    } else if (fileText.isDirectory()) {
      const data = jsonFileName(name, newPathName)
      fileData = fileData.concat(data)
    }
  }
  return fileData
}

// 上传文件夹
async function putFast (sftp) {
  return new Promise(((resolve, reject) => {
    const data = jsonFileName(path.join(process.cwd(), localDir))
    data.forEach((val, index) => {
      const { name, type } = val
      const newData = path.join(serverDir, name)
      if (type === 'files') {
        // 创建文件夹
        sftp.mkdir(newData.split(path.sep).join('/'))
        if (index === data.length - 1) {
          resolve()
        }
      } else if (type === 'file') {
        // 上传文件
        sftp.fastPut(
          path.join(process.cwd(), localDir, name).split(path.sep).join('/'), // 本地 assets.tar.gz 文件路径
          path.join(serverDir, name), // 服务器 assets.tar.gz 文件路径
          {},
          (err, result) => {
            if (err) throw err;
            if (index === data.length - 1) {
              resolve()
            }
          }
        );
      }
    })
  }))
}

exports.connRun = function ({ host, port, username, password, localDir: localDirName, serverDir: serverDirName }) {
  localDir = localDirName
  serverDir = serverDirName
  // ssh连接远程服务器
  conn.on('ready', () => {
    conn.sftp( async (err, sftp) => {
      if (err) throw err;
      const data = await getSftp(sftp)
      if (data) {
        // 备份儿文件夹
        renameSftp(sftp)
      }
      // 上传文件夹
      await putFast(sftp)
      conn.end()
      console.log('上传成功')
    });
  })

  conn.connect({
    host,
    port,
    username,
    password
  })
}
