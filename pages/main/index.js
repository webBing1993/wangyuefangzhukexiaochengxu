const app = getApp()
var UIhelper = require('../../utils/uihelper.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noCheckoutshowModal: false,
    confirmCheckoutshowModal: false,
    isMoreRoom: true, //是否有更多房间
    SearchOrderData: false,
    identityCheckStatus: false, //是否已经身份核验通过
    roomList: [],
    showRoomLeft: 70, //房卡左边距
    selectedIndex: 0,
    windowWidth: 100,
  },

  bindOpenRoom: function(e) {
    var id = e.currentTarget.dataset.id;
    var liveStatus = e.currentTarget.dataset.livestatus;
    if (liveStatus == 'REGISTER') {
      wx.navigateTo({
        url: '../regist/index?roomOrderId=' + e.currentTarget.dataset.id + '&ownerId=' + e.currentTarget.dataset.ownerid,
      })
    } else {
      //判斷是否到入住時間
      var that = this
      var predictCheckinTime = UIhelper.formatDateTime(that.data.roomList[that.data.selectedIndex].predictCheckinTime);
      console.log("predictCheckinTime " + predictCheckinTime);
      if (new Date() < predictCheckinTime) {
        UIhelper.showMessage('未到入住时间');
      } else {
        wx.navigateTo({
          url: '../room/card?orderId=' + id,
        })
      }
    }
  },
  ruleAction: function(e) {
    var that = this
    var roomId = e.currentTarget.dataset.id;
    UIhelper.checkOutApply(roomId, function() {
      that.setData({
        noCheckoutshowModal: true
      })
    });
  },
  checkInRegist: function(e) {
    var that = this;
    var predictCheckinTime = UIhelper.formatDateTime(that.data.roomList[that.data.selectedIndex].predictCheckinTime);
    app.globalData.currentRoomCheckinTime = predictCheckinTime;
    wx.navigateTo({
      url: '../regist/index?roomOrderId=' + e.currentTarget.dataset.id + '&ownerId=' + e.currentTarget.dataset.ownerid,
    })

  },
  checkOutAction: function(e) {
    var that = this
    //判断是否当前退房
    var id = e.currentTarget.dataset.id;
    var index = UIhelper.getDataIndex(id, that.data.roomList);
    //var predictCheckoutTime = new Date(that.data.roomList[index].predictCheckoutTime);
    var checkOutTime = that.data.roomList[index].predictCheckoutTime.substring(0, 4) + "-" + that.data.roomList[index].predictCheckoutTime.substring(5, 7) + "-" + that.data.roomList[index].predictCheckoutTime.substring(8, 10);
    console.log("predictCheckoutTime " + checkOutTime);
    if (new Date() < new Date(checkOutTime)) {
      that.setData({
        noCheckoutshowModal: true,
        roomId: id
      })
    } else {
      that.setData({
        confirmCheckoutshowModal: true,
        roomId: id
      })
    }
  },
  scroll: function(e) {
    var that = this;
    var index = 0;
    var item = 180;
    var scrollLeft = e.detail.scrollLeft;
    //var jianju = (scrollLeft / (that.data.windowWidth-100))
    // for (var i = 0; i < that.data.roomList.length;i++){
    //   if (scrollLeft < item){
    //     index=0;
    //     break;
    //   } else if ((scrollLeft) > (item * i) && scrollLeft < (item *(i+1))){
    //     index = i;
    //     break;
    //   }
    // }
    var kuandu = parseInt(e.detail.scrollWidth / (that.data.roomList.length + 1));
    var selectedWidth = scrollLeft / kuandu;
    console.log('宽度 ' + kuandu + '  滑动坐标 ' + scrollLeft + '  计算索引 ' + selectedWidth + '   转换之后索引 ' + parseInt(selectedWidth));

    index = parseInt(selectedWidth);
    //console.log('index ' + index + '     ' + e.detail.scrollWidth + '  ' + kuandu + '   ' + parseInt(jianju));
    that.setData({
      selectedIndex: index
    })
  },
  get_Tel: function(e) {
    var that = this
    if (e.currentTarget.dataset.tel != null) {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.tel
      })
    }
  },
  checkOutConfirm: function(e) {
    var that = this
    var roomId = that.data.roomId;
    UIhelper.checkOutApply(roomId, function() {
      that.setData({
        noCheckoutshowModal: false,
        confirmCheckoutshowModal: false
      })
    });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function() {},
  /**
   * 隐藏模态对话框
   */
  hideModal: function(e) {
    var type = e.currentTarget.dataset.item;
    var that = this
    that.setData({
      noCheckoutshowModal: false,
      confirmCheckoutshowModal: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    wx.hideHomeButton();
    that.setData({
      windowWidth: wx.getSystemInfoSync().windowWidth
    });
    // that.setData({
    //   SearchOrderData: app.globalData.SearchOrderData
    // });
    // if (app.globalData.SearchOrderData == null) {
    //   app.globalData.SearchOrderData = true;
    //   wx.reLaunch({
    //     url: '../order/notfound',
    //   })
    // }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    that.loadViewData();
  },
  loadViewData: function() {
    //显示房间
    let that = this
    that.setData({
      roomList: []
    });
    UIhelper.getOrderActive(function(result) {
      console.log('查询到订单数据');
      console.log(result);
      if (result.data.data == null || result.data.data.length == 0) {
        wx.reLaunch({
          url: '../order/notfound?',
        })
      } else {

        //保存房间数据
        var roomData = result.data.data;
        if (roomData != null) {
          for (var i = 0; i < roomData.length; i++) {

            var predictCheckinTime = UIhelper.formatDate(new Date(roomData[i].predictCheckinTime));
            var showCheckInDate = predictCheckinTime.substring(5, 7) + '月' + predictCheckinTime.substring(8, 10) + '日';
            var showCheckInTime = predictCheckinTime.substring(11, 16);
            var showCheckInWeekday = UIhelper.getWeekDay(predictCheckinTime);

            var predictCheckoutTime = UIhelper.formatDate(new Date(roomData[i].predictCheckoutTime));
            var showCheckoutDate = predictCheckoutTime.substring(5, 7) + '月' + predictCheckoutTime.substring(8, 10) + '日';
            var showCheckoutTime = predictCheckoutTime.substring(11, 16);
            var showCheckoutWeekday = UIhelper.getWeekDay(predictCheckoutTime);

            var dayNumber = UIhelper.getNumberOfDays(predictCheckinTime, predictCheckoutTime);

            var roomName = roomData[i].roomName;
            var id = roomData[i].id;
            var liveStatus = roomData[i].liveStatus;
            var address = '';
            if (roomData[i].roomGroup.address != null) {
              address = roomData[i].roomGroup.address.replace('#', '').replace('#', '');
            }
            if (roomData[i].roomGroup.addressDetail != null) {
              address = address + roomData[i].roomGroup.addressDetail;
            }
            that.data.roomList.push({
              id: id,
              roomName: roomName,
              showCheckInDate: showCheckInDate,
              showCheckInTime: showCheckInTime,
              showCheckInWeekday: showCheckInWeekday,
              showCheckoutDate: showCheckoutDate,
              showCheckoutTime: showCheckoutTime,
              showCheckoutWeekday: showCheckoutWeekday,
              dayNumber: dayNumber,
              liveStatus: liveStatus,
              predictCheckinTime: predictCheckinTime,
              predictCheckoutTime: predictCheckoutTime,
              roomGroup: roomData[i].roomGroup,
              roomGroupName: roomData[i].roomGroupName,
              ownerId: roomData[i].ownerId,
              address: address
            });
          }
          var roomLeft = 70;
          if (that.data.roomList.length > 1) {
            roomLeft = 36;
          }
          that.setData({
            roomList: that.data.roomList,
            showRoomLeft: roomLeft,
            SearchOrderData: true
          });
          app.globalData.currentRoomInfo = that.data.roomList
        }
      }
    });
  },
  get_Location: function(e) {
    var that = this
    // if (e.currentTarget.dataset.id.latitude != null && e.currentTarget.dataset.id.longitude != null) {
    //   let latitude = parseFloat(e.currentTarget.dataset.id.latitude)
    //   let longitude = parseFloat(e.currentTarget.dataset.id.longitude)
    // }
    // wx.openLocation({
    //   latitude: 31.22017,
    //   longitude: 121.35999,
    //   scale: 15,
    //   name: '上海复创互联网科技有限公司',
    //   address: '上海长宁区金钟路633号B栋2楼'
    // })
    if (that.data.roomList[that.data.selectedIndex].roomGroup.latitude == null) {
      UIhelper.showMessage('名宿坐标未配置');
    } else {
      wx.openLocation({
        latitude: that.data.roomList[that.data.selectedIndex].roomGroup.latitude,
        longitude: that.data.roomList[that.data.selectedIndex].roomGroup.longitude,
        scale: 15,
        name: that.data.roomList[that.data.selectedIndex].roomGroupName,
        address: that.data.roomList[that.data.selectedIndex].address
      })
    }

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
    let that = this;
    that.loadViewData();
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    var roomOrderId = e.target.dataset.roomorderid;
    return {
      title: '欢迎使用电子房卡',
      path: '/pages/user/login?roomOrderId=' + roomOrderId
    }
  }
})