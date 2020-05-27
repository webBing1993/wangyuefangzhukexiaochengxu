var blePlugin = requirePlugin('bleSdk-plugin')
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res.code)
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function () {
    //搜索当前门锁蓝牙
    var iotBleSdk = blePlugin.initBleSdk({
      debug: true, //是否打开调试
      retryCount: 0, //操作设备失败的重试次数
      connectionTimeout: 10, //尝试与设备建立连接的超时时间
    });
    this.globalData.iotBleSdk = iotBleSdk
  },
  globalData: {
    iotBleSdk:null,
    userInfo: null,
    userPhone:'',
    SearchOrderData: true,
    GuestRoomList:null,
    currentRoomInfo:null,
    currentRoomCheckinTime:null,//当前选择的房间入住时间
    mobile:'',
    maxRssi:90
  }
})