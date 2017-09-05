import wx from 'weixin-js-sdk'
/**
 * 配置常量
 */
// API 基础路径
global.API_BASH_PATH = process.env.API_BASH_PATH
// token 存储加密
global.TOKEN_ENCRYPT = process.env.TOKEN_ENCRYPT
// 刷新token地址
global.REFRESH_TOKEN_URI = '/user/token/refresh'
global.APP_NAME = 'STONE'
global.APP_TITLE = '陨石科技'
global.DEFAULT_AVATAR = '/static/images/common/default-avatar.png'
global.PAGE_SIZE = 20
global.WX_USER = 'WX_USER'

// 浏览器识别
var ua = navigator.userAgent.toLowerCase()
global.Browser = {
  isWechat: /micromessenger/.test(ua),
  isAlipay: /alipayclient/.test(ua),
  isCrawler: /author\/crawler/.test(ua)
}

/**
 * 设置浏览器标题
 * @param title
 */
global.setDocumentTitle = function (title) {
  title = title || global.APP_TITLE
  document.title = title
  if (/ip(hone|od|ad)/i.test(navigator.userAgent)) {
    setTimeout(function () {
      var iframe = document.createElement('iframe')
      iframe.src = '/MP_verify_dbtLjvj0pndDlxpP.txt'
      iframe.style.display = 'none'
      iframe.onload = function () {
        setTimeout(function () {
          iframe.remove()
        }, 0)
        document.body.appendChild(iframe)
      }
    }, 0)
  }
}

/**
 * 设置窗体配置
 */
global.setWin = function () {
  var winWidth = window.innerWidth
  var winHeight = window.innerHeight
  let fontSize = winWidth / 375 * 20
  document.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px'
  // 窗体
  global.$win = {
    screenRatio: winHeight / winWidth,
    rem: fontSize,
    width: winWidth,
    height: winHeight,
    widthRem: winWidth / fontSize,
    heightRem: winHeight / fontSize
  }
}

/**
 * APP 下载
 */
global.downloadApp = function () {
  if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) {
   // TODO
  } else {
    // TODO
  }
}

/**
 * 微信配置初始化
 */
global.initWx = function (response) {
  wx.ready(function () {
    console.log('wx.ready')
  })
  wx.error(function (res) {
    console.log('wx err', res)
  })
  wx.config({
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: response.app_id, // 必填，公众号的唯一标识
    timestamp: response.timestamp, // 必填，生成签名的时间戳
    nonceStr: response.nonce_str, // 必填，生成签名的随机串
    signature: response.signature, // 必填，签名，见附录1
    jsApiList: ['scanQRCode', 'openLocation', 'getLocation', 'chooseWXPay', 'onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  })

  var shareTitle = '陨石商城'
  var shareDesc = '陨石商城'
  var shareIcon = global.DEFAULT_AVATAR
  var link = 'http://h5.tianji007.com/?v=2017'

  // 分享到朋友圈
  wx.onMenuShareTimeline({
    title: shareTitle, // 分享标题
    link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl: shareIcon // 分享图标
  })

  // 分享给好友
  wx.onMenuShareAppMessage({
    title: shareTitle, // 分享标题
    desc: shareDesc, // 分享描述
    link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl: shareIcon // 分享图标

  })
}

export {}
