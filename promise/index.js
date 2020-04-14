// Promise 对象用于表示一个异步操作的最终状态（完成或失败），以及其返回的值。

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

// new Promise((resolve, reject) => { resolve(value) }).then(fulfilled, rejected)
function MyPromise(fn) {
  let value = null
  let callbacks = []
  let state = 'pending'

  this.then((fulfilled, rejected) => {
    return new MyPromise((resolve, reject) => {
      if (state === 'pending') {
        callbacks.push(fulfilled)
      } else if (state === 'fulfilled') {
        let data = fulfilled(value)
        resolve(data)
      } else {
        let reason = rejected(value)
        rejected(reason)
      }
    })
  })

  function resolve(valueNew) {
    let state = 'fulfilled'
    value = valueNew
    execute()
  }

  function reject(valueNew) {
    let state = 'rejected'
    value = valueNew
    execute()
  }

  function execute() {
    //加入延时机制 防止promise里面有同步函数 导致resolve先执行 then还没注册上函数
    setTimeout(() => {
      callbacks.forEach(callback => {
        value = callback(value)
      })
    }, 0)
  }

  this.catch = function(e) {
    console.log(JSON.stringify(e))
  }

  fn(resolve, reject)
}

Promise.all = promises => {
  let aRet = new Array(promise.length)
  return new Promise(resolve => {
    let i = 0
    next()
    function next() {
      promises[i].then(res => {
        aRet[i] = res
        i++
        if (i === promises.length) {
          resolve(aRet)
        } else {
          next()
        }
      })
    }
  })
}

// Promise.all 并发限制
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
    const e = p.then(() => executing.splice(executing.indexOf()))
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
function asyncPool2(poolLimit, array, iteratorFn) {
  const ret = []
  const executing = []
  for (const iterator of array) {
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

const iteratorFn = param => new Promise(resolve => setTimout(() => {
  console.log(param);
  resolve(param)
}, 1000))

asyncPool(2, [1,2,3,4,5,6,7,8,9,10], iteratorFn)