const app = getApp()
var UIhelper = require('../../utils/uihelper.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 0,
    roomOrderGuestId: '',
    roomOrderId: '26',
    userInfo: {},
  },
  bindcamera: function(e) {
    let that = this;
    var type = e.currentTarget.dataset.item;
    if (that.data.userInfo.idcard == '' || that.data.userInfo.idcard == null) {
      UIhelper.showMessage('身份证号不能为空');
      return false;
    }
    if (that.data.userInfo.idcard.length != 18) {
      UIhelper.showMessage('身份证号格式不正确');
      return false;
    }

    if (that.data.userInfo.nationCode == null || that.data.userInfo.nationCode == '') {
      UIhelper.showMessage('名族不能为空');
      return false;
    }
    UIhelper.saveRoomOrderGuest(that.data.roomOrderId, [that.data.userInfo], function() {
      wx.navigateTo({
        url: '../regist/camera?type=' + type + '&userId=' + that.data.roomOrderGuestId + '&orderId=' + that.data.roomOrderId,
      })
    });

  },
  bindNext: function() {
    let that = this;
    if (that.data.userInfo.idcard == '' || that.data.userInfo.idcard == null) {
      UIhelper.showMessage('身份证号不能为空');
      return false;
    }
    if (that.data.userInfo.idcard.length != 18) {
      UIhelper.showMessage('身份证号格式不正确');
      return false;
    }
    if (that.data.userInfo.idcardImgObverse == null || that.data.userInfo.idcardImgReverse == null) {
      UIhelper.showMessage('身份证照片未上传');
      return false;
    }
    if (that.data.userInfo.nationCode == null || that.data.userInfo.nationCode == '') {
      UIhelper.showMessage('名族不能为空');
      return false;
    }

    UIhelper.saveRoomOrderGuest(that.data.roomOrderId, [that.data.userInfo], function() {
      wx.navigateTo({
        url: '../regist/face?userId=' + that.data.roomOrderGuestId + '&orderId=' + that.data.roomOrderId,
      })
    })
  },
  idcardInput: function(e) {
    let that = this;
    that.data.userInfo.idcard = e.detail.value;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.userId != undefined) {
      that.setData({
        roomOrderGuestId: options.userId,
        roomOrderId: options.orderId
      })
    } else {
      that.setData({
        roomOrderGuestId: '702923511865282560'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    UIhelper.getNation(function(res) {
      UIhelper.getGuest(that.data.roomOrderId, that.data.roomOrderGuestId, function(result) {
        that.setData({
          userInfo: {
            id: result.data.data.id,
            name: result.data.data.name,
            idcard: result.data.data.idcard,
            idcardImgObverse: result.data.data.idcardImgObverse,
            idcardImgReverse: result.data.data.idcardImgReverse,
            nationCode: result.data.data.nationCode,
            nationName: result.data.data.nationName
          },
          nationName: result.data.data.nationName,
          nationList: res.data.data
        });
        if (result.data.data.nationCode!=null){
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].code == result.data.data.nationCode) {
              that.setData({
                rangekey:i-1
              });
              break;
            }
          }
        }
        if (that.data.nationName == null || that.data.nationName==''){
          //默认选中第一个 "汉"
          that.setData({
            rangekey:-1,
            nationName: that.data.nationList[0].name
          })
          that.data.userInfo.nationCode = that.data.nationList[0].code;
          that.data.userInfo.nationName = that.data.nationList[0].name;
        }
      });
    });
  },
  bindPickerChange: function(e) {
    var that = this;
    that.data.userInfo.nationCode = that.data.nationList[e.detail.value].code;
    that.data.userInfo.nationName = that.data.nationList[e.detail.value].name;
    this.setData({
      rangekey:parseInt(e.detail.value)-1, //修改选中的下标
      nationName: that.data.userInfo.nationName
    })
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