// A promise represents the eventual result of an asynchronous operation.

// new Promise((resolve, reject) => { resolve(value) }).then(fulfilled, rejected)

const isObject = (value) => {
  const type = typeof value
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

const isThenable = (value) => !!value && value.then

const isPromise = (value) =>
  (typeof Promise !== 'undefined' && value instanceof Promise) ||
  (value !== null &&
    typeof value === 'object' &&
    typeof value.then === 'function' &&
    typeof value.catch === 'function')

class Promise {
  /**
   *Creates an instance of MPromise.
   * @param {(resolve: value => any, reject: reason => any)} executor
   * @memberof MPromise
   */
  constructor(executor) {
    this.status = 'pending'
    this.value = null
    this.reason = null
    this.caught = false

    // NOTE: 2.2.6. then may be called multiple times on the same promise
    // const p = new MPromise((resolve, reject) => {})
    // p.then(resolve => {}, reject => {}).catch(err => {})
    // p.then(...)
    this.onFulfilledList = []
    this.onRejectedList = []

    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }

    const resolve = (value) => {
      // 如果 value 是一个 promies，resolve 其结果，如下 ret 为 fetch 结果
      // new Promise(resolve => resolve(fetch(xxx))).then(ret => ret)
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }
      if (this.status === 'pending') {
        this.status = 'fulfilled'
        this.value = value
        this.onFulfilledList.forEach((cb) => cb(value))
      }
    }

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.reason = reason
        this.onRejectedList.forEach((cb) => cb(reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  // NOTE: 2.2.7 then must return a promise
  then = (onFulfilled, onRejected) => {
    if (typeof onFulfilled !== 'function') onFulfilled = (value) => value
    if (typeof onRejected !== 'function') onRejected = (reason) => reason

    // NOTE: 2.2.7.1. if either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise, x)
    const promise2 = new Promise((resolve, reject) => {
      if (this.status === 'pending') {
        // 此时  this.value = null，待调用
        this.onFulfilledList.push((value) => {
          setTimeout(() => {
            try {
              const x = onFulfilled(value)
              Promise.resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
        this.onFulfilledList.push((reason) => {
          setTimeout(() => {
            try {
              const x = onRejected(reason)
              Promise.resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      } else if (this.status === 'fulfilled') {
        // 如果已经处于 fulfilled rejected 直接传参 this.value 调用
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            Promise.resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      } else if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.value)
            Promise.resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
    })
    return promise2
  }

  static resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError('🚫循环引用!'))
    }
    if (isObject(x)) {
      let resolvedOrRejected = false

      // resolvePromise rejectPromise 只能被调用一次
      const resolvePromise = (y) => {
        if (resolvedOrRejected) return
        resolvedOrRejected = true
        Promise.resolvePromise(promise2, y, resolve, reject)
      }

      const rejectPromise = (r) => {
        if (resolvedOrRejected) return
        resolvedOrRejected = true
        return reject(err)
      }

      let then
      try {
        then = x.then
      } catch (error) {
        reject(error)
      }

      if (typeof then === 'function') {
        try {
          then.call(x, resolvePromise, rejectPromise)
        } catch (error) {
          if (!resolvedOrRejected) {
            resolvedOrRejected = true
            reject(error)
          }
        }
      } else {
        resolve(x)
      }
    } else {
      // 保证 ret 透传 value, p.then().then(ret => ret)
      resolve(x)
    }
  }

  catch(onRejected) {
    this.then(undefined, onRejected)
  }

  finally(onFinally) {
    this.then(onFinally, onFinally)
  }

  static resolve(value) {
    if (isPromise(value)) {
      return value
    }
    return new Promise((resolve, reject) => {
      if (isThenable) {
        value.then(
          (value) => resolve(value),
          (reason) => reject(reason),
        )
      } else {
        resolve(value)
      }
    })
  }

  static reject(reason) {
    return new Promise((resolve, reject) => reject(reason))
  }

  static all(promises) {
    const resolveValues = []
    if (promise.length === 0) {
      return Promise.resolve(resolveValues)
    }

    let completedCount = 0
    return new Promise((resolve, reject) => {
      promises.forEach((promise, index) => {
        if (!isThenable(promise)) {
          promise = Promise.resolve(promise)
        }
        promise.then(
          (value) => {
            completedCount++
            resolveValues[index] = value
            if (completedCount === promises.length) {
              resolve(resolveValues)
            }
          },
          (reason) => reject(reason),
        )
      })
    })
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      for (const promise of promises) {
        promise.then(
          (value) => resolve(value),
          (reason) => reject(reason),
        )
      }
    })
  }
}

// 简洁实现
function PromiseM(fn) {
  var value = null
  var callbacks = []
  //加入状态 为了解决在Promise异步操作成功之后调用的then注册的回调不会执行的问题
  var state = 'pending'
  var _this = this

  //注册所有的回调函数
  this.then = function (fulfilled, rejected) {
    //如果想链式promise 那就要在这边return一个new Promise
    return new PromiseM(function (resolv, rejec) {
      //异常处理
      try {
        if (state == 'pending') {
          callbacks.push(fulfilled)
          //实现链式调用
          return
        }
        if (state == 'fulfilled') {
          var data = fulfilled(value)
          //为了能让两个promise连接起来
          resolv(data)
          return
        }
        if (state == 'rejected') {
          var data = rejected(value)
          //为了能让两个promise连接起来
          resolv(data)
          return
        }
      } catch (e) {
        _this.catch(e)
      }
    })
  }

  //执行所有的回调函数
  function resolve(valueNew) {
    value = valueNew
    state = 'fulfilled'
    execute()
  }

  //执行所有的回调函数
  function reject(valueNew) {
    value = valueNew
    state = 'rejected'
    execute()
  }

  function execute() {
    //加入延时机制 防止promise里面有同步函数 导致resolve先执行 then还没注册上函数
    setTimeout(function () {
      callbacks.forEach(function (cb) {
        value = cb(value)
      })
    }, 0)
  }

  this.catch = function (e) {
    console.log(JSON.stringify(e))
  }

  //经典 实现异步回调
  fn(resolve, reject)
}
