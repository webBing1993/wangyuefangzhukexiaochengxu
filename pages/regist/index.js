const app = getApp()
var UIhelper = require('../../utils/uihelper.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: 0,
    showUpdate: false,
    showVerification: false,
    guestUserList: [],
    registerUserList: [],
    id: '',
    userInfo: {},
    checkedIndex: 0,
    isOwner: true
  },
  updateUser: function(e) {
    var that = this;
    var userId = e.currentTarget.dataset.id;
    var index = UIhelper.getDataIndex(userId, that.data.registerUserList)
    that.setData({
      showUpdate: true,
      checkedIndex: index
    });
  },
  confirmUpdateUser: function(e) {
    let that = this;
    var userId = e.currentTarget.dataset.id;
    UIhelper.saveRoomOrderGuest(that.data.id, [that.data.registerUserList[that.data.checkedIndex]], function() {
      that.showRegisterUserList(false);
      that.setData({
        showUpdate: false
      });
    })
  },
  inputUpdateName: function(e) {
    let that = this;
    that.data.registerUserList[that.data.checkedIndex].name = e.detail.value;
  },
  inputUpdateMobile: function(e) {
    let that = this;
    that.data.registerUserList[that.data.checkedIndex].mobile = e.detail.value;
  },

  showVerification: function() {
    var that = this;
    that.setData({
      showVerification: true
    });
  },
  bindLater: function() {
    wx.reLaunch({
      url: '../main/index',
    })
  },
  bindUrent: function() {
    let that = this
    that.setData({
      showVerification: false
    });
    // wx.navigateTo({
    //   url: '../regist/Idcard',
    // })
  },
  hideModal: function() {
    var that = this;
    that.setData({
      showUpdate: false,
      showVerification: false
    });
  },
  bindConfirm: function(e) {
    var that = this;
    var userId = e.currentTarget.dataset.id;
    if (that.data.status == 0) {

    } else {
      //判断是否大于当前时间
      if (new Date() < app.globalData.currentRoomCheckinTime) {
        UIhelper.showMessage('未到入住时间');
      } else {
        //判断是否有编辑过登记人
        wx.navigateTo({
          url: '../regist/Idcard?userId=' + userId + '&orderId=' + that.data.id,
        })
      }
    }
  },
  saveUserCallBack: function(result) {
    let that = this;
    console.log('入住登记返回结果：' + result);
    that.showRegisterUserList(true);
  },
  showRegisterUserList: function(refush) {
    let that = this;
    //查询已登记人
    UIhelper.getRoomOrderGuest(that.data.id, function(result) {
      console.log('查询登记人信息：' + result);
      that.data.registerUserList = [];
      for (var i = 0; i < result.data.data.length; i++) {
        var item = result.data.data[i];
        that.data.registerUserList.push({
          code: i,
          id: item.id,
          name: item.name,
          mobile: item.mobile,
          identityCheckStatus: item.identityCheckStatus
        });
      }
      if (refush) {
        that.setData({
          registerUserList: that.data.registerUserList,
          guestUserList: [],
          status: 1
        });
      } else {
        that.setData({
          registerUserList: that.data.registerUserList
        });
      }
    })
  },
  bindHome: function(e) {
    let that = this
    //判断姓名和手机号是否正确
    if (!that.verificatioin()) {
      return;
    }
    if (that.data.guestUserList.length == 0) {
      wx.reLaunch({
        url: '../main/index',
      })
      return
    }
    wx.canvasToTempFilePath({
      x: 0, //画布x轴起点
      y: 0, //画布y轴起点
      width: that.data.width, //画布宽度
      height: that.data.height, //画布高度
      canvasId: 'attendCanvasId',
      success: function(resImg) {
        UIhelper.uploadFile(resImg.tempFilePath, function(result) {
          if (that.data.guestUserList.length > 0) {
            var data = [];
            for (var i = 0; i < that.data.guestUserList.length; i++) {
              var item = that.data.guestUserList[i];
              if (item.deleted != true) {
                data.push({
                  name: item.name,
                  mobile: item.mobile,
                  idcard: item.idcard,
                  nationCode: item.nationCode,
                  nationName: item.nationName,
                  idcardImgReverse: result.data,
                  idcardImgObverse: result.data,
                  livePhoto: result.data,
                });
              }
            }
            UIhelper.saveRoomOrderGuest(that.data.id, data, function(res) {
              UIhelper.getRoomOrderGuest(that.data.id, function(result) {
                if (result.data.data.length != 0) {
                  UIhelper.guestIdentityCheck(that.data.id, result.data.data[0].id, function(result) {
                    //判断是否到入住时间
                    wx.reLaunch({
                      url: '../main/index',
                    })
                  });
                }
              })
            })
          }
        });
      }
    });
  },
  //校验输入手机号
  verificatioin: function() {
    let that = this
    for (var i = 0; i < that.data.guestUserList.length; i++) {
      if (that.data.guestUserList[i].deleted != true) {
        if (that.data.guestUserList[i].name == '') {
          UIhelper.showMessage('姓名不能为空');
          return false;
        }
        if (that.data.guestUserList[i].mobile == '') {
          UIhelper.showMessage('请输入手机号码');
          return false;
        }
        if (that.data.guestUserList[i].mobile.length != 11) {
          UIhelper.showMessage('请输入正确的手机号');
          return false;
        }
        if (that.data.guestUserList[i].idcard == '') {
          UIhelper.showMessage('请输入您的身份证');
          return false;
        }
        if (that.data.guestUserList[i].idcard.length != 18) {
          UIhelper.showMessage('请输入正确的身份证号码');
          return false;
        }
        if (!UIhelper.checkIdCard(that.data.guestUserList[i].idcard)) {
          UIhelper.showMessage('请输入正确的身份证号码');
          return false;
        }
      }
    }
    return true;
  },

  //添加同住人
  addGuestUser: function() {
    let that = this;
    that.data.guestUserList.push({
      code: that.data.guestUserList.length,
      name: '',
      mobile: '',
      idcard: '',
      nationName: '汉族',
      nationCode: '0'
    });
    that.setData({
      guestUserList: that.data.guestUserList
    });
  },

  deleteUser: function(e) {
    let that = this;
    var code = e.currentTarget.dataset.id;
    that.data.guestUserList[code].deleted = true;
    that.setData({
      guestUserList: that.data.guestUserList
    });
  },
  deleteGuestUser: function(e) {
    let that = this;
    var userId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认是否删除？',
      showCancel: true,
      mask: false,
      success(res) {
        if (res.confirm) {
          for (var i = 0; i < that.data.registerUserList.length; i++) {
            if (that.data.registerUserList[i].id == userId) {
              that.data.registerUserList[i].deleted = true;
              UIhelper.saveRoomOrderGuest(that.data.id, that.data.registerUserList, that.saveUserCallBack)
              break;
            }
          }
        }
      }
    });
  },
  nameInput: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    that.data.guestUserList[id].name = e.detail.value;
  },
  phoneInput: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id
    that.data.guestUserList[id].mobile = e.detail.value;
  },
  idcardInput: function(e) {
    let that = this
    var id = e.currentTarget.dataset.id
    that.data.guestUserList[id].idcard = e.detail.value;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.roomOrderId != undefined) {
      that.setData({
        id: options.roomOrderId
      })
    }
    if (options.ownerId != undefined) {
      //判断userid和ownerid是否一致
      console.log('getJsCodeUserId:' + UIhelper.getJsCodeUserId());
      console.log('ownerId:' + options.ownerId);
      if (UIhelper.getJsCodeUserId() == options.ownerId) {
        that.setData({
          isOwner: true
        })
      } else {
        that.setData({
          isOwner: false
        })
      }

    }
  },
  getUserListCallBack: function(result) {
    let that = this;
    if (result.data.data.length == 0) {
      that.data.guestUserList.push({
        code: 0,
        id: '',
        name: '',
        mobile: ''
      });
    } else {
      for (var i = 0; i < result.data.data.length; i++) {
        var item = result.data.data[i];
        if (i == 0) {
          that.setData({
            userInfo: {
              id: item.id,
              name: item.name,
              mobile: item.mobile
            }
          });
        }
        that.data.guestUserList.push({
          code: i,
          id: item.id,
          name: item.name,
          mobile: item.mobile
        });
      }
    }
    that.setData({
      guestUserList: that.data.guestUserList
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    that.getRoomOrderUser();
    that.getNation();
  },
  getNation: function() {
    let that = this
    UIhelper.getNation(function(res) {
      that.setData({
        nationList: res.data.data
      });
    })
  },
  bindPickerChange: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id
    that.data.guestUserList[id].nationName = that.data.nationList[e.detail.value].name;
    that.data.guestUserList[id].nationCode = that.data.nationList[e.detail.value].code;
    that.setData({
      guestUserList: that.data.guestUserList,
    });
  },
  getRoomOrderUser: function(callBackFun) {
    let that = this;
    UIhelper.getRoomOrderGuest(that.data.id, function(result) {
      if (result.data.data.length == 0) {
        that.data.guestUserList.push({
          code: 0,
          id: '',
          name: '',
          mobile: app.globalData.userPhone,
          idcard: '',
          nationName: '汉族',
          nationCode: '0'
        });
        that.setData({
          guestUserList: that.data.guestUserList
        });
      } else {
        that.data.registerUserList = [];
        var identityCheckStatus=false
        for (var i = 0; i < result.data.data.length; i++){
          var item = result.data.data[i];
          if (item.identityCheckStatus =='PASS'){
            identityCheckStatus=true;
            break;
          }
        }
        for (var i = 0; i < result.data.data.length; i++) {
          var item = result.data.data[i];
          that.data.registerUserList.push({
            code: i,
            id: item.id,
            name: item.name,
            mobile: item.mobile,
            identityCheckStatus: identityCheckStatus == true ?'PASS': item.identityCheckStatus,
            idcard: item.idcard,
            nationName: item.nationName,
          });
        }
        that.setData({
          registerUserList: that.data.registerUserList,
          guestUserList: [],
          status: 1
        });
      }
      if (callBackFun != null) {
        callBackFun();
      }
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