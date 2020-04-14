const app = getApp()
var UIhelper = require('../../utils/uihelper.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
   mobile:''
  },
  bindLogin: function (e) {
    wx.reLaunch({
      url: '../user/login?relogin=true',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton();
    let that=this;
    if (app.globalData.mobile==''){
    UIhelper.getUserInfo(function(res){
      that.setData({
        mobile: res.data.data.phoneNumber
      });
    })
    }else{
      that.setData({
        mobile: app.globalData.mobile
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})