/**
 * decorator 装饰器
 * 包装原有模块并且不影响其原有功能
 * 需要 babel 转义
 */
function decorateArmour(target, key, descriptor) {
  const method = descriptor.value
  let moreDef = 100
  let ret
  descriptor.value = (...args) => {
    args[0] += moreDef
    ret = method.apply(target, args)
    return ret
  }
  return descriptor
}

class Man {
  constructor(def = 2, atk = 3, hp = 3) {
    this.init(def, atk, hp)
  }

  @decorateArmour
  init(def, atk, hp) {
    this.def = def // 防御值
    this.atk = atk // 攻击力
    this.hp = hp // 血量
  }
  toString() {
    return `防御力:${this.def},攻击力:${this.atk},血量:${this.hp}`
  }
}

var tony = new Man()

// 这里其实就是 '' + tony, 自然会调用 tony 的 toString 方法
console.log(`${tony}`)
