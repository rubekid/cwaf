/**
 * ajax 请求
 * Created by Administrator on 2017-08-11.
 */
import axios from 'axios'
import AuthEncrypt from './auth-encrypt'
import DateUtil from './date-util'
import TokenManager from './token-manager'
import AjaxCache from './ajax-cache'

var Http = {
  get: function (config) {
    config.method = 'GET'
    Http.execute(config)
  },
  post: function (config) {
    config.method = 'POST'
    Http.execute(config)
  },
  put: function (config) {
    config.method = 'PUT'
    Http.execute(config)
  },
  delete: function (config) {
    config.method = 'DELETE'
    Http.execute(config)
  },
  execute: function (config) {
    config.method = (config.method || 'get').toUpperCase()
    if (config.method === 'GET' && !config.data) {
      config.useLast = true
    }
    config.data = config.data || {}
    Http.combine(config)

    // 设置头部
    config.headers = config.headers || {}
    config.headers['Content-Type'] = 'application/json'

    //
    if (!config.permit) {
      var token = TokenManager.get()
      config.headers['Authorization'] = AuthEncrypt.getMac(config.method, config.baseURL + config.url, token)
    }

    // 成功回调
    var successCallback = config.success || function (response, status, headers, config) {}
    config.success = null
    delete config.success

    // 失败回调
    var errorCallback = config.error || function (response, status, headers) {
      if (config.ignore) {
        return
      }
      if (response && response.code.indexOf('ACCESS_DENIED') > -1) {
        global.login()
        return
      } else if (response && response.message) {
        global.showError(response.message)
      }
    }
    config.error = null
    delete config.error

    var completeCallback = function () {
      if (typeof config.complete === 'function') {
        config.complete()
      }
    }

    // 使用缓存数据
    if (config.method === 'GET') {
      var lastResponse = AjaxCache.get(config.url)
      if (config.useLast && lastResponse) {
        successCallback(lastResponse)
      }
    }

    config.timeout = 10000
    axios(config).then(function (result) {
      var response = result.data
      successCallback(response)
      completeCallback()

      // 设置数据缓存
      if (config.useLast) {
        AjaxCache.set(config.url, response)
      }
    }).catch(function (error) {
      if (error && error.response) {
        var data = error.response ? (error.response.data || {}) : {}
        errorCallback(data)
      } else {
        console.log('Error', error.message)
        throw error
      }
      completeCallback()
    })
  },
  /**
   * 数据合并
   * @param config
   */
  combine (config) {
    var isFormData = config.data instanceof window.FormData
    if (!isFormData) {
      // 过滤掉null数据
      var _data = {}
      for (var i in config.data) {
        var val = config.data[i]
        if (val === null || typeof val === 'undefined') {
          continue
        }
        if (/\d{4}-\d{1,2}-\d{1,2} {1}\d{1,2}:\d{1,2}:\d{1,2}$/.test(val)) {
          val = DateUtil.toDate(val)
        }
        _data[i] = val
      }
      config.data = _data
      config.url = AuthEncrypt.httpUrlFormat(config.url, config.data, config.method)
    }
    // 非http开头的加上API_BASE_PATH
    if (config.url.indexOf('http') !== 0) {
      config.baseURL = global.API_BASH_PATH
    }
  }
}
export default Http

