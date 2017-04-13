### ECMAScript 2015

## 1、let const

 + `let、const` 不存在变量提升，无法重复声明
 + 暂时性死区（即 `let、const` 声明变量前 此变量是无法被声明或赋值的）
 + `const` 本质是保证变量的引用地址无法被改动，例如其定义一个数组，`const` 指向的数组地址无法被改动，但是可以push增加其值
 + `let、const` 声明的变量，虽然是全局变量，但是不再属于 `window`，与 `var` 不同