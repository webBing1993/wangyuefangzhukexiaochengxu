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
    rooms: [],
    showRoomLeft: 70, //房卡左边距
    selectedIndex: 0,
    windowWidth: 100,
    pageIndex: 1,
  },

  bindOpenRoom: function(e) {
    var that = this
    var id = e.currentTarget.dataset.id;
    var liveStatus = e.currentTarget.dataset.livestatus;
    if (liveStatus == 'REGISTER') {
      var predictCheckinTime = UIhelper.formatDateTime(that.data.roomList[that.data.selectedIndex].predictCheckinTime);
      app.globalData.currentRoomCheckinTime = predictCheckinTime;
      wx.navigateTo({
        url: '../regist/index?roomOrderId=' + e.currentTarget.dataset.id + '&ownerId=' + e.currentTarget.dataset.ownerid,
      })
    } else {
      //判斷是否到入住時間
      var predictCheckinTime = UIhelper.formatDateTime(that.data.roomList[that.data.selectedIndex].predictCheckinTime);
      var predictCheckoutTime = UIhelper.formatDateTime(that.data.roomList[that.data.selectedIndex].predictCheckoutTime);
      console.log("predictCheckinTime " + predictCheckinTime);
      if (new Date() < predictCheckinTime) {
        UIhelper.showMessage('未到入住时间');
      }
       else if (predictCheckoutTime < new Date()) {
        UIhelper.showMessage('订单已过离店时间');
      } 
      else {
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
    var predictCheckoutTime = UIhelper.formatDateTime(that.data.roomList[that.data.selectedIndex].predictCheckoutTime);
    app.globalData.currentRoomCheckinTime = predictCheckinTime;
    if (predictCheckoutTime < new Date()) {
      UIhelper.showMessage('订单已过离店时间');
      return
    }
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
  //获取用户地理位置权限
  getPermission: function(obj) {
    var that = this;
    that.setData({
      pageIndex: 1,
      rooms: []
    });
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        that.getSearchRooms(longitude, latitude)
      },
      fail: function(res) {
        if (res.errCode == 2) {
          that.getSearchRooms("", "")
          UIhelper.showMessage('请打开手机定位开关');
        } else {
          wx.getSetting({
            success: function(res) {
              var statu = res.authSetting;
              if (!statu['scope.userLocation']) {
                wx.showModal({
                  title: '是否授权当前位置',
                  content: '需要获取您的地理位置，请确认授权，否则附件房源功能将无法使用',
                  success: function(tip) {
                    if (tip.confirm) {
                      wx.openSetting({
                        success: function(data) {
                          if (data.authSetting["scope.userLocation"] === true) {
                            //授权成功之后，再调用chooseLocation选择地方
                            wx.getLocation({
                              type: 'wgs84',
                              success: function(res) {
                                var latitude = res.latitude
                                var longitude = res.longitude
                                that.getSearchRooms(longitude, latitude)
                              }
                            })

                          } else {
                            //授权失败
                            that.getSearchRooms("", "")
                          }
                        }
                      })
                    }
                  }
                })
              }
            },
            fail: function(res) {
              //授权失败
              that.getSearchRooms("", "")
            }
          })

        }

      }
    })
  },
  getSearchRooms: function(longitude, latitude) {
    var that = this;
    var data = {
      // longitude: 121.48789949,
      // latitude: 31.24916171
      longitude: longitude,
      latitude: latitude
    }
    UIhelper.getSearchRoom(that.data.pageIndex, 10, data, function(res) {
      if (res.data.data.length > 0) {
        for (var i = 0; i < res.data.data.length; i++) {
          var address = res.data.data[i].address
          var distance = res.data.data[i].distance
          if (address != null) {
            res.data.data[i].address = address.replace('#', '').replace('#', '');
            var newAddress = res.data.data[i].address + res.data.data[i].addressDetail;
            if (newAddress.length > 21) {
              newAddress = newAddress.substring(0, 20) + '...';
            }
            res.data.data[i].newAddress = newAddress;
            res.data.data[i].distance = parseInt(distance / 1000)
          }
          that.data.rooms.push(res.data.data[i]);
        }
        that.setData({
          rooms: that.data.rooms,
          SearchOrderData: false
        })
      } else {
        that.setData({
          pageIndex: (that.data.pageIndex - 1)
        })
      }
    })
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
    //增加小程序分享进入
    var jsCodeUserId = UIhelper.getJsCodeUserId();
    if (jsCodeUserId == "") {
      wx.reLaunch({
        url: '../user/login'
      })
    } else {
      that.loadViewData();
    }

    // wx.getSystemInfo({
    //   success: function (res) {
    //     if (res.platform == "devtools") {

    //     } else if (res.platform == "ios") {
    //       console.log('IOS');
    //       app.globalData.maxRssi=80;
    //     } else if (res.platform == "android") {
    //       console.log('Android');
    //       app.globalData.maxRssi = 90;
    //     }
    //   }
    // })
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
        // wx.reLaunch({
        //   url: '../order/notfound?',
        // })
        that.setData({
          SearchOrderData: false
        });
        that.getPermission();

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
            var newAddress = address;
            if (address.length > 21) {
              newAddress = address.substring(0, 20) + '...';
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
              newAddress: newAddress,
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
  get_roomLocation: function(e) {
    var index = e.currentTarget.dataset.index;
    var that = this
    wx.openLocation({
      latitude: that.data.rooms[index].latitude,
      longitude: that.data.rooms[index].longitude,
      scale: 15,
      name: that.data.rooms[index].name,
      address: that.data.rooms[index].address + '' + that.data.rooms[index].addressDetail
    })
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
    var that = this;
    if (that.data.rooms.length > 0) {
      that.setData({
        pageIndex: (that.data.pageIndex + 1)
      });
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          var latitude = res.latitude
          var longitude = res.longitude
          that.getSearchRooms(longitude, latitude)
        },
        fail: function(res) {
          that.getSearchRooms('', '')
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    var that = this;
    var roomOrderId = e.target.dataset.roomorderid;
    return {
      title: '欢迎使用电子房卡',
      imageUrl: that.data.roomList[that.data.selectedIndex].roomGroup.mainImage,
      path: '/pages/user/login?roomOrderId=' + roomOrderId
    }
  }
})