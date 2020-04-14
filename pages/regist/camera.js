const app = getApp()
var UIhelper = require('../../utils/uihelper.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomOrderGuestId: '',
    roomOrderId: '26',
    idCardType: 'front', //默认正面身份证照片
    userInfo: {},
    submitEnable: false,
    width: 200,
    height: 300
  },
  takePhoto() {
    console.log('拍照')
    let that = this;
    that.setData({
      submitEnable: true
    });
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        that.upLoadFile(res.tempImagePath);
      }
    })
  },
  upLoadFile: function(tempImagePath) {
    var that = this;
    UIhelper.uploadFile(tempImagePath, function(result) {
      if (that.data.idCardType == 'front') {
        that.setData({
          userInfo: {
            id: that.data.roomOrderGuestId,
            idcardImgObverse: result.data
          }
        });
      } else if (that.data.idCardType == 'behind') {
        that.setData({
          userInfo: {
            id: that.data.roomOrderGuestId,
            idcardImgReverse: result.data
          }
        });
      }
      UIhelper.saveRoomOrderGuest(that.data.roomOrderId, [that.data.userInfo], function() {
        wx.navigateBack();
      })
    });
  },
  binderror: function(e) {
    console.log('用户不允许使用摄像头');
    wx.showModal({
      title: '提示',
      content: '请开启摄像头授权完成核验',
      showCancel: false,
      mask: false
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.orderId != undefined) {
      that.setData({
        roomOrderGuestId: options.userId,
        roomOrderId: options.orderId,
        idCardType: options.type
      })
    } else {
      that.setData({
        roomOrderGuestId: '702923511865282560',
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

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