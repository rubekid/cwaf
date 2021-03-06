/**
 * Token管理
 */
import axios from 'axios'
import AuthEncrypt from './auth-encrypt'
import Storage from './storage'
import DateUtil from './date-util'
import CryptoJS from 'crypto-js/core'
import AES from 'crypto-js/aes'

// token缓存
var tokenCacheKey = (global.APP_NAME || '') + '_USER_TOKEN'

// 登录信息缓存
var loginCacheKey = (global.APP_NAME || '') + '_REMEMBER'
var secretKey = 'YT79jp64wJWqfvqY'
var TokenManager = {
  refreshLocked: false,
  loginLocked: false,
  // 获取token
  getToken: function () {
    var data = Storage.get(tokenCacheKey)
    var token = data
    if (data && global.TOKEN_ENCRYPT) {
      try {
        var bytes = AES.decrypt(data, secretKey)
        token = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      } catch (e) {
        console.log(e.message)
        token = null
      }
    }
    return token
  },
  get: function () {
    var token = TokenManager.getToken()
    if (!token || DateUtil.isExpired(token.expires_at)) {
      token = null
      this.clear(tokenCacheKey)
    }
    TokenManager.checkToken(token)
    return token
  },
  // 获取当前用户ID
  getUserId: function () {
    var token = this.get()
    if (token) {
      return token.user_id
    }
    return null
  },
  // 设置token
  set: function (token) {
    if (global.TOKEN_ENCRYPT) {
      var tokenString = AES.encrypt(JSON.stringify(token), secretKey).toString()
      Storage.set(tokenCacheKey, tokenString)
    } else {
      Storage.set(tokenCacheKey, token)
    }
  },
  // 清理token
  clear: function () {
    Storage.remove(tokenCacheKey)
  },
  checkToken: function (token) {
    try {
      if (TokenManager.refreshLocked) {
        return
      }
      var needAutoLogin = false
      if (token) {
        var expireAt = DateUtil.toDate(token.expires_at)
        var remainTime = expireAt.getTime() - new Date().getTime()
        if (remainTime > 10 * 1000 && remainTime < 10 * 60 * 1000) { // 10 分钟
          var config = {
            baseURL: global.API_BASH_PATH,
            url: global.REFRESH_TOKEN_URI,
            method: 'get'
          }

          config.headers = {}
          config.headers['Content-Type'] = 'application/json'
          config.headers['Authorization'] = AuthEncrypt.getMac(config.method, config.baseURL + config.url, token)

          TokenManager.refreshLocked = true
          axios(config).then(function (response) {
            var token = response.data
            if (token && token.access_token) {
              TokenManager.set(token)
            }
            TokenManager.refreshLocked = false
          }).catch(function (e) {
            TokenManager.refreshLocked = false
            console.log(e.message)
            needAutoLogin = true
          })
        } else if (remainTime < 10000) {
          needAutoLogin = true
        }
      } else {
        needAutoLogin = true
      }
    } catch (e) {
      console.log(e.message)
    }
    if (needAutoLogin) {
      TokenManager.autoLogin()
    }
  },
  /**
   * 记住账号
   * @param loginData
   */
  remember (loginData) {
    var str = AES.encrypt(JSON.stringify(loginData), secretKey)
    Storage.set(loginCacheKey, str.toString())
  },
  forget () {
    Storage.remove(loginCacheKey)
  },
  /**
   * 自动登录
   */
  autoLogin () {
    try {
      if (TokenManager.loginLocked) {
        return
      }
      var loginString = Storage.get(loginCacheKey)
      if (!loginString) {
        return
      }
      var bytes = AES.decrypt(loginString, secretKey)
      var loginData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      var config = {
        baseURL: global.API_BASH_PATH,
        url: '/v1.0/app/user/login',
        method: 'post',
        data: loginData
      }
      config.headers = {}
      config.headers['Content-Type'] = 'application/json'
      TokenManager.loginLocked = true
      axios(config).then(function (response) {
        var token = response.data
        if (token && token.access_token) {
          TokenManager.set(token)
        }
        TokenManager.loginLocked = false
      }).catch(function (e) {
        TokenManager.loginLocked = false
        console.log(e.message)
      })
    } catch (e) {
      console.log(e.message)
    }
  }
}

/**
 * 唤醒token检测
 */
var wakeUpTokenCheck = function () {
  console.log('runTokenCheck')
  var token = TokenManager.getToken()
  TokenManager.checkToken(token)
}
wakeUpTokenCheck()

// 每分钟轮询
setInterval(function () {
  wakeUpTokenCheck()
}, 60000)

export default TokenManager
