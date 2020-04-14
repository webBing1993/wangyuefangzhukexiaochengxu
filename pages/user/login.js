var UIhelper = require('../../utils/uihelper.js')
const app = getApp()
var seconds = 60;
Page({
  data: {
    mobile: '',
    smsCode: '',
    setInter: '获取验证码',
    showView: true,
    shareRoomId: '' //分享获取房间ID
  },

  //手机号输入
  mobileInput: function(e) {
    let that = this
    that.setData({
      mobile: e.detail.value
    });
  },

  //验证码输入
  smsCodeInput: function(e) {
    let that = this
    that.setData({
      smsCode: e.detail.value
    });
  },

  //获取验证码
  bindSmsCode: function(e) {
    let that = this
    if (that.verificatioinMobile()) {
      if (e.currentTarget.dataset.value != '获取验证码') {
        return;
      }
      that.daojishi(60);
      UIhelper.authSms(that.data.mobile, that.getSmsResult);
    }
  },
  getSmsResult: function(result) {
    let that = this;
    if (result.data.errcode == '0') {
      wx.showToast({
        title: '发送成功',
        icon: 'success',
        duration: 2000
      })
    }
  },
  //倒计时
  daojishi: function(seconds) {
    let that = this
    if (seconds > 1) {
      seconds--;
      that.setData({
        setInter: seconds + "秒后获取"
      });
      setTimeout(function() {
        that.daojishi(seconds);
      }, 1000);
    } else {
      that.setData({
        setInter: '获取验证码'
      });
    }
  },

  //校验输入手机号
  verificatioinMobile: function() {
    let that = this
    if (that.data.mobile == '') {
      UIhelper.showMessage('请输入手机号码');
      return false;
    }
    if (that.data.mobile.length != 11) {
      UIhelper.showMessage('请输入正确的手机号');
      return false;
    }
    return true;
  },

  //校验验证码输入
  verificatioinSmsCode: function() {
    let that = this
    if (that.data.smsCode == '') {
      UIhelper.showMessage('请输入验证码');
      return false;
    }
    if (that.data.smsCode.length != 6) {
      UIhelper.showMessage('请输入正确的验证码');
      return false;
    }
    return true;
  },

  //登录
  bindLogin: function(e) {
    let that = this
    if (that.verificatioinMobile() && that.verificatioinSmsCode()) {
      UIhelper.authSmsLogin(that.data.mobile, that.data.smsCode, that.loginCallBack)
    }
  },
  bindLoginTest: function() {
    let that = this
    UIhelper.setToken('11fa58c6-c01b-46b7-a0ed-35444859ae85');
    UIhelper.getOrderActive(that.getOrder);
  },
  //登录成功回调
  loginCallBack: function(result) {
    let that = this
    console.log('登录成功回调');
    var token = result.header['X-auth-token'];
    console.log('token:' + token);
    UIhelper.setToken(token);
    var jsCodeUserId = result.data.data.userId;
    console.log('userId:' + jsCodeUserId);
    UIhelper.setJsCodeUserId(jsCodeUserId);
    app.globalData.mobile = that.data.mobile
    console.log('分享房间ID：' + that.data.shareRoomId);
    //判断当前是否是分享进入
    if (that.data.shareRoomId != '' && that.data.shareRoomId != undefined) {
      UIhelper.getRoomBind(that.data.shareRoomId, function() {
        wx.reLaunch({
          url: '../main/index',
        })
      })
    } else {
      //查询订单数据
      //UIhelper.getOrderActive(that.getOrder);
      wx.reLaunch({
        url: '../main/index',
      })
    }

  },
  getOrder: function(result) {
    let that = this
    console.log('查询到订单数据');
    console.log(result);
    if (result.data.data == null) {
      wx.reLaunch({
        url: '../order/notfound',
      })
    } else {
      //保存房间数据
      app.globalData.GuestRoomList = result.data.data;
      wx.reLaunch({
        url: '../main/index',
      })
    }
  },
  getPhoneNumber(e) {
    let that = this;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      UIhelper.getwxPhoneNumberLogin(e.detail.iv, e.detail.encryptedData, that.loginCallBack)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    wx.hideHomeButton();
    if (options.roomOrderId != undefined) {
      console.log('从分享进入' + options.roomOrderId);
      that.setData({
        shareRoomId: options.roomOrderId
      });
    }
    if (options.relogin == undefined) {
      UIhelper.getJsCodeLogin(that.loginCallBack);
    } else {
      UIhelper.getLogout(function() {
        UIhelper.setTokenClear();
        UIhelper.getJsCodeLogin(function(result) {
          var token = result.header['X-auth-token'];
          console.log('token:' + token);
          UIhelper.setToken(token);
        });
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})