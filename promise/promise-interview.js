// ---------- 执行顺序 -----------
new Promise((resolve, reject) => {
  console.log('promise1')
  resolve()
})
  .then(
    // p1 callback
    () => {
      console.log('then1-1')
      // p2
      new Promise((resolve, reject) => {
        console.log('promise2')
        resolve()
      })
        .then(() => {
          // p2 callback
          console.log('then2-1')
        })
        .then(() => {
          // p2 then callback
          console.log('then2-2')
        })
    },
  )
  .then(() => {
    // p1 then callback
    console.log('then1-2')
  })

/*
运行结果：promise1 then1-1 promise2 then2-1 then1-2 then2-2
题解：根据 Promise 的实现，line3 resolve 后， p1 callback 开始执行，依次打印同步任务，此时将 p2 callback 放入 jobs 中，
     继续执行 line18，将 p1 then callback 放入 jobs 中，jobs 依次执行，输出 line14，发现 p2 then callback 放入 jobs 中
     执行 p1 then callback job, 执行 p2 then callback
*/

new Promise((resolve, reject) => {
  console.log('promise1')
  resolve()
})
  .then(() => {
    console.log('then11')
    return new Promise((resolve, reject) => {
      console.log('promise2')
      resolve()
    })
      .then(() => {
        console.log('then21')
      })
      .then(() => {
        console.log('then23')
      })
  })
  .then(() => {
    console.log('then12')
  })
// promise1 then11 promise2 then21 then23 then12

new Promise((resolve) => {
  console.log('promise1', 1)
  resolve()
})
  .then(() => {
    console.log('then11', 2)
    new Promise((resolve) => {
      console.log('promise2', 3)
      resolve()
    })
      .then(() => {
        console.log('then21', 4)
        new Promise((resolve) => {
          console.log('promise3', 5)
          resolve()
        })
          .then(() => {
            console.log('then31', 7)
          })
          .then(() => {
            console.log('then32', 9)
          })
      })
      .then(() => {
        console.log('then22', 8)
      })
  })
  .then(() => {
    console.log('then12', 6)
  })
// 1 2 3 4 5 6 7 8 9

// ---------- Promise.all 并发限制 -----------
// LINK: https://segmentfault.com/a/1190000016389127
// ES6
function asyncPool(poolLimit, array, iteratorFn) {
  let i = 0
  const ret = []
  const executing = []
  const enqueue = function () {
    if (i === array.length) {
      return Promise.resolve()
    }
    const item = array[i++]
    const p = Promise.resolve().then(() => iteratorFn(item))
    ret.push(p)
    const e = p.then(() => executing.splice(executing.indexOf(e), 1))
    executing.push(e)
    let r = Promise.resolve()
    if (executing.length >= poolLimit) {
      r = Promise.race(executing)
    }
    return r.then(() => enqueue())
  }

  return enqueue().then(() => Promise.all(ret))
}

// ES7
async function asyncPool2(poolLimit, array, iteratorFn) {
  const ret = []
  const executing = []
  for (const iterator of array) {
    // 使用 Promise.resolve 保证有 then 方法
    const p = Promise.resolve().then(() => iteratorFn(iterator))
    ret.push(p)
    const e = p.then(() => executing.splice(executing.indexOf(e), 1))
    executing.push(e)
    if (executing.length >= poolLimit) {
      await Promise.race(executing)
    }
  }
  return Promise.all(ret)
}

const iteratorFn = (param) =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log(param)
      resolve(param)
    }, 1000 * param),
  )

asyncPool(2, [1, 5, 2, 4, 3], iteratorFn)
