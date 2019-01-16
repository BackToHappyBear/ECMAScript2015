// Promise 对象用于表示一个异步操作的最终状态（完成或失败），以及其返回的值。

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}