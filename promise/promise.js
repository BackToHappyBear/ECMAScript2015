// https://promisesaplus.com/#point-36

// What
// A promise represents the eventual result of an asynchronous operation.
// The primary way of interacting with a promise is through its then method,
// which registers callbacks to receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.

// 1. Terminology
// 1.1 "promise" is an object or function with a then method whose behavior conforms to this specification
// 1.2 "thenable" is an object or function that defines a then method
// NOTE: 1.3 "value" is any legal JavaScript value (including undefined, a thenable, or a promise)
// 1.4 "exception" is a value that is thrown using the throw statement
// 1.5 "reason" is a value that indicates why a promise was rejected

// 2.2 The then Method
// A promise's then method accepts two arguments:
// promise.then(onFulfulled, onRejected)
// 2.2.1. Both onFulfulled and onRejected are optional arguments and if not a funtion ignored
// NOTE: 2.2.2. if onFulfilled is a function
// 2.2.2.1. it must be called after promise is fulfilled, whth promise's value as its first argument
// 2.2.2.2. it must not be called before promise is fulfilled
// 2.2.2.3. it must not be called more than once
// 2.2.3 same as onFulfilled
// NOTE: 2.2.4. onFulfilled or onRejected must not be called unitll the execution context stack contains only platform code
// 2.2.5. onFulfilled and onRejected must be called as functions(i.e. with no this value)
// NOTE: 2.2.6. then may be called multiple times on the same promise
// 多次调用：p.then(() => { something... }) p.then(() => { something else... })
// 2.2.6.1. if/when promise is fulfilled, all respective onFulfilled callback must execute in
//          order of their originating calls to then
// 2.2.6.2  onRejected same as onFulfilled
// NOTE: 2.2.7 then must return a promise
// promise2 = promise1.then(onFulfilled, onRejected)
// NOTE: 2.2.7.1. if either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise, x)
// NOTE: 2.2.7.2. if either onFulfilled or onRejected throw an exception e, promise2 must be rejected with e as the reason.
// 2.2.7.3 if onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1
// Promise.resolve(1).then().then(ret => ret) // 1
// 2.2.7.4. onRejected same as onFulfilled

// 链式调用：new Promise((resolve, reject) => { resolve(value) }).then(fulfilled, rejected)

// 2.3 The Promise Resolution Procedure
// To run [[Resolve]](promise, x), perform the following steps
// 2.3.1. if promise and x refer to the same object, reject promise with a TypeError as the reason
// 2.3.2. if x is a promise, adopt its state
// NOTE: 2.3.2.1. if x is pending, promise must remain pending until x is fulfilled or rejected
// 2.3.3.2. if/when x is fulfilled, fulfill promise with the same value
// 2.3.3.3. rejected same as fulfilled
// 2.3.3 Otherwise, if x is an object or function
// NOTE: 2.3.3.1. let then be x.then[3.5]
// 2.3.3.1. let then be x.then
// 2.3.3.2. if retrieving the property x.then results in a thrown exception e, reject promise with e as the reason
// 2.3.3.3. if then is a function, call it with x as this, first arugment resolvePromise, and seacond argument rejectPromise
// 2.3.3.4. if then is not a function, fulfill promise with x
// 2.3.4. if x is not an object or function, fulfill promise with x

// https://blog.csdn.net/cnailili/article/details/104204567
function MyPromise(func) {
  var self = this
  self.status = 'pending' //进来时就先定义一个'pending'状态；等待调用时改变状态；
  self.resolveValue = null //MyPromise增加两个变量，方便之后储存参数；
  self.rejectReason = null
  //完成异步操作：
  self.ResolveCallBackList = [] //存储注册时成功的函数；
  self.RejectCallBackList = [] //存储失败时成功的函数；
  //完成MyPromise的两个方法：
  function resolve(value) {
    //成功的方法；
    if (self.status === 'pending') {
      self.status = 'Fulfilled' //成功回调触发'Fulfilled'状态；
      self.resolveValue = value //把传入的'value'形参存到MyPromise中；方便调用.then()时有该参数；
      self.ResolveCallBackList.forEach(function (ele) {
        //调用时可执行异步操作；；
        ele()
      })
    }
  }
  function reject(reason) {
    //失败的方法；
    if (self.status === 'pending') {
      self.status = 'Rejected' //失败回调触发'Rejected'状态；
      self.rejectReason = reason
      self.RejectCallBackList.forEach(function (ele) {
        //调用时可执行异步操作；
        ele()
      })
    }
  }
  //同步执行时抛出错误后的兼容：
  try {
    //当抛出错误后直接执行失败的回调函数；
    func(resolve, reject) //创建MyPromise时就同步执行；
  } catch (e) {
    reject(e)
  }
}

//解决ruturn值的方法:
function ResolutionReturnPronise(nextPromise, returnValue, res, rej) {
  //可以利用，之后的.then()注册的回调函数，都是注册在nextPromise身上的这一特点巧妙处理；
  if (returnValue instanceof MyPromise) {
    //返回值为Promise时：
    returnValue.then(
      function (val) {
        //直接让返回值链式调用.then()方法
        res(val) //方法中成功方法直接执行成功回调；
      },
      function (reason) {
        rej(reason) //失败方法直接执行失败回调；
      },
    )
  } else {
    //返回值为普通值时
    res(returnValue) //会执行成功的回调：
  }
}

//完善.then()方法：
MyPromise.prototype.then = function (func1, func2) {
  //原方法可插入成功和失败两个方法；
  //处理空then()：
  if (!func1) {
    //如果为空将参数原封不用返回；
    func1 = function (val) {
      return val
    }
  }
  if (!func2) {
    //如果为空将错误原封不动返回；
    func2 = function (reason) {
      throw new Error(reason)
    }
  }
  var self = this
  //实现原方法调用.then()方法是返回的是一个属性Promise对象；
  var nextPromise = new MyPromise(function (res, rej) {
    //完成同步操作：
    if (self.status === 'Fulfilled') {
      //.then()本身是异步操作：由于没有微任务权限，这里用setTimeout()使每一步为异步操作:
      setTimeout(function () {
        //完善数据捕获功能；(无论错误出现在成功还是失败中都会在失败的回调中找出)
        try {
          //                     var nextResolveValue = func1(self.resolveValue);
          // //原方法返回一个普通值时会执行成功的回调：
          //                     res(nextResolveValue);
          var nextResolveValue = func1(self.resolveValue)
          ResolutionReturnPronise(nextPromise, nextResolveValue, res, rej) //由于异步执行，此处nextPromise可以直接传进去；
        } catch (e) {
          rej(e)
        }
      }, 0)
    }
    if (self.status === 'Rejected') {
      setTimeout(function () {
        try {
          //完善数据捕获功能；
          var nextRejectValue = func2(self.rejectReason)
          // res(nextRejectValue); //原方法返回一个普通值时会执行成功的回调；
          ResolutionReturnPronise(nextPromise, nextRejectValue, res, rej)
        } catch (e) {
          rej(e)
        }
      }, 0)
    }
    //完成异步操作：
    if (self.status === 'pending') {
      //如果状态为'pending'
      self.ResolveCallBackList.push(function () {
        //注册成功函数时放到成功回调数组中；
        setTimeout(function () {
          try {
            //完善数据捕获功能；
            var nextResolveValue = func1(self.resolveValue)
            // res(nextResolveValue); //原方法返回一个普通值时会执行成功的回调；
            ResolutionReturnPronise(nextPromise, nextResolveValue, res, rej)
          } catch (e) {
            rej(e)
          }
        }, 0)
      })
      self.RejectCallBackList.push(function () {
        //注册失败函数时放到成功回调数组中；
        setTimeout(function () {
          try {
            //完善数据捕获功能；
            var nextRejectValue = func2(self.rejectReason)
            // res(nextRejectValue); //原方法返回一个普通值时会执行成功的回调；
            ResolutionReturnPronise(nextPromise, nextRejectValue, res, rej)
          } catch (e) {
            rej(e)
          }
        }, 0)
      })
    }
  })
  //完成链式调用：
  return nextPromise //要知道：之后的.then()注册的回调函数，都是注册在nextPromise身上的；
}

//完善.race()方法：
MyPromise.race = function (promiseArr) {
  return new MyPromise(function (resolve, reject) {
    promiseArr.forEach(function (promise, index) {
      promise(resolve, reject) //哪个状态最先改变一定会先触发；
    })
  })
}

//完善.all()方法：
MyPromise.all = function (promiseArr) {
  return new MyPromise(function (resolve, reject) {
    if (!Array.isArray(promiseArr)) {
      return reject(new TypeError('argument must be anarray'))
    }
    var countNum = 0
    var promiseNum = promiseArr.length
    var resolvedvalue = new Array(promiseNum)
    for (var i = 0; i < promiseNum; i++) {
      ;(function (i) {
        promiseArr[i].then(
          function (value) {
            //对每一个数组中的Promise对象进行单独.then();
            countNum++
            resolvedvalue[i] = value
            if (countNum === promiseNum) {
              return resolve(resolvedvalue) //全部成功时，输出所有的已存到数组中的结果；
            }
          },
          function (reason) {
            return reject(reason) //否则输出该最先被reject(reason) 的状态值；
          },
        )
      })(i)
    }
  })
}

//测试MyPromise:
const oMP = new MyPromise((res, rej) => {
  // res('同步操作');
  setTimeout(function () {
    res('异步操作')
    // rej('异步操作');
  }, 500)
})
oMP
  .then(
    (val) => {
      console.log(val + '-成功回调')
      // return '成功';
      // throw new Error('抛出错误');
      return new MyPromise((res, rej) => {
        res('return Promise')
      })
    },
    (reason) => {
      console.log(reason + '-失败回调')
      // return '失败';
      throw new Error('抛出错误')
    },
  )
  .then(
    (val) => {
      console.log(val + '-成功回调1')
    },
    (reason) => {
      console.log(reason + '-失败回调2')
    },
  )

function text(num) {
  return new MyPromise((resolve, reject) => {
    //return new Promise();
    setTimeout(() => {
      //进行一个异步操作；
      // resolve(num);  //假设全部成功：执行结果为：[ 'a', 'b', 'c' ]
      Math.random() * 100 > 50 ? resolve(num) : reject(num) //随机数大于50执行成功，否则执行失败；
    }, 100)
  })
}
const oMP1 = MyPromise.all([text('a'), text('b'), text('c')]).then(
  (val) => {
    console.log('成功：' + val) //全成功时才会触发成功回调；结果为：[ 'a', 'b', 'c' ]
  },
  (reason) => {
    console.log('失败：' + reason) //有一个失败就返回最先被reject(num)的状态值；结果可能为 a || b || c;
  },
)
