// async function 声明用于定义一个返回 AsyncFunction 对象的异步函数。
// 异步函数是指通过事件循环异步执行的函数，它会通过一个隐式的 Promise 返回其结果。
// 但是如果你的代码使用了异步函数，它的语法和结构会更像是标准的同步函数。

// 1
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(function () {
  console.log('setTimeout')
}, 0)
async1();

new Promise(function (resolve) {
  console.log('promise1')
  resolve();
}).then(function () {
  console.log('promise2')
})

console.log('script end')

// await 返回一个 promise resolve的结果
'script start'
'async1 start'
'async2'
'promise1'
'script end'
'promise2'
'async1 end'
'setTimeout'

// 修改为 Promise 格式
// new Promise((resolve, reject) => {
//   console.log("async1 start");
//   console.log("async2");
//   resolve(Promise.resolve());
// }).then(() => {
//   console.log("async1 end");
// });
// new Promise(function(resolve) {
//   console.log("promise1");
//   resolve();
// }).then(function() {
//   console.log("promise2");
// });


// 2
fn = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 2000)
  })
}
const Fn = () => {
  fn().then((res) => {
    console.log(res)
  })
  console.log(2)
}
Fn()
console.log(3)
// 2 3 1

// 3
fn = () => {
  return new Promise((resolve, reject) => {
    console.log(4)
    setTimeout(() => {
      resolve(1)
    }, 2000)
  })
}
const Fn = async () => {
  await fn().then((res) => {
    console.log(res)
  })
  console.log(2)
}
Fn()
console.log(3)
// 3 1 2
/*
 * await 会等到 promise 执行完成并返回结果
 * async awit 是 Generator 的语法糖 而非 Promise
 * 如下是依次执行
 * const a = await fn().then(...)
 * const b = [...a]
 * console.log(4)
 */

// 4
// macrotasks: setTimeout setInterval setImmediate I / O UI渲染
// microtasks: Promise process.nextTick Object.observe MutationObserver

/** 
 * 5 async await 串行/并行 处理
 *   https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
 */
// sequence
async function printFiles() {
  const files = await getFilePaths();

  for (const file of files) {
    const contents = await fs.readFile(file, 'utf8');
  }
}
// parallenl
async function printFiles() {
  const files = await getFilePaths();

  await Promise.all(files.map(async (file) => {
    const contents = await fs.readFile(file, 'utf8')
  }));
}

// ---------------------------------------
const promises = [
  new Promise((resolve => resolve(1))),
  new Promise((resolve => resolve(2))),
  new Promise((resolve => resolve(3))),
];

// for-of 同步迭代：输出三个 promise 对象
async function test1() {
  for (const obj of promises) {
    console.log(obj);
  }
}

// for-await-of 异步迭代，等待 Promise resove 并返回结果
async  function test2() {
  for await (const obj of promises) {
    console.log(obj); 
  }
}

test1(); // promise, promise, promise
test2(); // 1, 2, 3

// 不用太纠结顺序，因为你也搞不清楚
new Promise((resolve, reject) => {
  // console.log("async1 start");
  // console.log("async2");
  resolve(Promise.resolve());
}).then(() => {
  console.log("async1 end");
});

new Promise(function (resolve) {
  // console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
}).then(function () {
  console.log("promise3");
}).then(function () {
  console.log("promise4");
});



new Promise((resolve, reject) => {
  // console.log("async1 start");
  // console.log("async2");
  resolve(Promise.resolve().then(() => console.log('A')));
}).then(() => {
  console.log("async1 end");
});

new Promise(function (resolve) {
  // console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
});