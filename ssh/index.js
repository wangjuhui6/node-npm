const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const projectUrl = process.cwd()
const { connRun } = require('./conn')

async function choiceTemplate (data) {
  if (data.length === 1) {
    return data[0]
  }
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '请选择模版',
      choices: data
    }
  ])
  return answer.template
}

async function upFile () {
  // 读取配置文件
  const data = fs.readdirSync(projectUrl).map(val => {
    if (fs.lstatSync(val).isFile() && path.extname(val) === '.js' && path.basename(val, path.extname(val)).indexOf('up-file') > -1) {
      return val
    }
  }).filter(val => val)
  if (!data[0]) {
    console.log('请添加配置文件，如：', [
      'up-file.js',
      'up-file.test.js'
    ])
    return
  }
  const template = await choiceTemplate(data)
  const text = require(path.join(projectUrl, template))
  connRun(text)
}

(function run () {
  const arguments = process.argv.slice(2);
  const name = arguments[0]
  const fun = {
    upFile
  }
  if (fun[name]) {
    fun[name]()
    return
  }
  console.log('无此命令')
})()
