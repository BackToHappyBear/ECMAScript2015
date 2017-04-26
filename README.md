# ECMAScript 2015

### 1、let const

 + `let、const` 不存在变量提升，无法重复声明
 + 暂时性死区（即 `let、const` 声明变量前 此变量是无法被声明或赋值的）
 + `const` 本质是保证变量的引用地址无法被改动，例如其定义一个数组，`const` 指向的数组地址无法被改动，但是可以push增加其值
 + `let、const` 声明的变量，虽然是全局变量，但是不再属于 `window`，与 `var` 不同
 
 ### 2、 class extends super
 + `super` 是一个 关键字 而非 标识符
 + 在 不同的语境 下有 不同的语义  具体如上例所示
 + 而且 子类 如果想创建自己的 构造函数 就必须在 `constructor` 中调用 `super` 方法，不然得不到 `this` 对象
 + 具体 看代码 理解

 ### 3、 arrow function
 + 语法格式
 + this 指向
 
 ### 4、 module
 + 导入导出方式
 + 灵活使用
 + 执行机制
 
 ### 5、destructuring
 + 解构、默认值语法
 + 使用场景
 
 ### 6、template string, ...rest
 + 语法
 + 应用场景(很灵活)
    - ...rest 作为函数参数
    - 替代 apply