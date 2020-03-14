// 项目发布阶段需要用要的插件。这样可以避免在开发阶段中使用这些插件
// const prodPlugins=[]
// if(process.env.NODE_ENV==='production'){
//   prodPlugins.push('transfrom-remove-console')
// }

module.exports = {
  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    // // 发布阶段需要用到的插件
    // ...prodPlugins
    "@babel/plugin-syntax-dynamic-import"
  ]
}