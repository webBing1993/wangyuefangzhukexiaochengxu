var blePlugin = requirePlugin('bleSdk-plugin')
var UIhelper = require('../../utils/uihelper.js')
Page({
  data: {
    BluetoothConnection: false,
    roomOrderGuestId: '',
    roomOrderId: '26',
    isSubmit: 3, //当前状态[0:可继续下一步,1:重试连接蓝牙,2:连接成功开始核验,3重试进行核验:,4:不显示]
    tishi: '正在检测蓝牙信号…',
    bindConfirmText: '',
    width: 50,
    height: 50,
    status: 0, //0正在检测蓝牙 1蓝牙连接成功 2蓝牙连接失败 3显示摄像头拍照
    message: '正在检测蓝牙信号…',
    submitTitle: '正在检测到蓝牙信号，请靠近门锁' //提交按钮提示
  },
  bindNext: function() {
    let that = this
    if (that.data.isSubmit == 1) {
      that.bindBluetoothDevices(that.data.bluetoothName);
    } else {
      //保存照片
      let that = this;
      const ctx = wx.createCameraContext()
      ctx.takePhoto({
        quality: 'low',
        success: (res) => {
          let tempImagePath = res.tempImagePath
          let fileLastName = tempImagePath.substring(tempImagePath.lastIndexOf(".") + 1)
          const ctx = wx.createCanvasContext('attendCanvasId');
          ctx.drawImage(tempImagePath, 0, 0, that.data.width, that.data.height);
          ctx.draw();
          wx.canvasToTempFilePath({
            x: 0, //画布x轴起点
            y: 0, //画布y轴起点
            width: that.data.width, //画布宽度
            height: that.data.height, //画布高度
            canvasId: 'attendCanvasId',
            success: function(resImg) {
              UIhelper.uploadFile(resImg.tempFilePath, function(result) {
                that.setData({
                  userInfo: {
                    id: that.data.roomOrderGuestId,
                    livePhoto: result.data
                  }
                });
                UIhelper.saveRoomOrderGuest(that.data.roomOrderId, [that.data.userInfo], function(result) {
                  //登记核验
                  UIhelper.guestIdentityCheck(that.data.roomOrderId, that.data.roomOrderGuestId, function(result) {
                    //判断核验结果
                    if (result.data.data.status != 'PASS') {
                      that.setData({
                        status: 3,
                        tishi: result.data.data.msg,
                        bindConfirmText: '重新核验'
                      });
                    } else {
                      wx.reLaunch({
                        url: '../room/card?orderId=' + that.data.roomOrderId,
                      })
                    }
                  });
                })
              })
            },
            fail(res) {}
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.orderId != undefined) {
      that.setData({
        roomOrderGuestId: options.userId,
        roomOrderId: options.orderId
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
    let that = this;
    UIhelper.getLockInfo(that.data.roomOrderId, function(result) {
      var bluetoothName = result.data.data.bluetoothName;
      that.setData({
        bluetoothName: bluetoothName
      });
      that.checkBluetooth();
    })
  },
  //检测蓝牙 是否可以连接
  checkBluetooth: function() {
    let that = this;
    UIhelper.getLockInfo(that.data.roomOrderId, function(result) {
      var bluetoothName = result.data.data.bluetoothName;
      that.setData({
        bluetoothName: bluetoothName
      });
      that.connectionBluetooth();
    })
  },
  connectionBluetooth: function() {
    let that = this;
    wx.openBluetoothAdapter({
      success(res) {
        console.log('蓝牙模块初始化成功')
        wx.startBluetoothDevicesDiscovery({
          success(res) {
            console.log("搜索设备：" + res)
            var result = JSON.stringify(res)
            console.log(result);
            setTimeout(function() {
              wx.getBluetoothDevices({
                success: function(res) {
                  console.log('发现设备', res)
                  var isconnection = false;
                  for (var i = 0; i < res.devices.length; i++) {
                    if (res.devices[i].name == that.data.bluetoothName) {
                      console.log('成功连接当前设备');
                      console.log('停止搜索蓝牙');
                      isconnection = true;
                      wx.stopBluetoothDevicesDiscovery({
                        success(res) {
                          console.log(res)
                        }
                      })
                      break;
                    }
                  }
                  if (isconnection) {
                    //成功
                    that.setData({
                      status: 1,
                      message: '蓝牙连接成功',
                      submitTitle: '开始核验'
                    });
                  } else {
                    //失败
                    that.setData({
                      status: 2,
                      message: '蓝牙连接失败',
                      submitTitle: '未检测到蓝牙信号，请靠近门锁'
                    });
                  }
                },
                fail: function(res) {
                  console.log("发现设备错误", res)
                  that.setData({
                    status: 2,
                    message: '蓝牙连接失败',
                    submitTitle: '未检测到蓝牙信号，请靠近门锁'
                  });
                }
              })
            }, 1000);
          },
          fail(result) {
            //失败
            that.setData({
              status: 2,
              message: '蓝牙连接失败',
              submitTitle: '未检测到蓝牙信号，请靠近门锁'
            });
          }
        })
      },
      fail(result) {
        //失败
        that.setData({
          status: 2,
          message: '请开启蓝牙',
          submitTitle: '重新连接'
        });
      }
    })
  },

  takePhoto:function(){
    //保存照片
    let that = this;
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        let tempImagePath = res.tempImagePath
        let fileLastName = tempImagePath.substring(tempImagePath.lastIndexOf(".") + 1)
        const ctx = wx.createCanvasContext('attendCanvasId');
        ctx.drawImage(tempImagePath, 0, 0, that.data.width, that.data.height);
        ctx.draw();
        wx.canvasToTempFilePath({
          x: 0, //画布x轴起点
          y: 0, //画布y轴起点
          width: that.data.width, //画布宽度
          height: that.data.height, //画布高度
          canvasId: 'attendCanvasId',
          success: function (resImg) {
            UIhelper.uploadFile(resImg.tempFilePath, function (result) {
              that.setData({
                userInfo: {
                  id: that.data.roomOrderGuestId,
                  livePhoto: result.data
                }
              });
              UIhelper.saveRoomOrderGuest(that.data.roomOrderId, [that.data.userInfo], function (result) {
                //登记核验
                UIhelper.guestIdentityCheck(that.data.roomOrderId, that.data.roomOrderGuestId, function (result) {
                  //判断核验结果
                  if (result.data.data.status != 'PASS') {
                    that.setData({
                      isSubmit: 3,
                      message: result.data.data.msg,
                      submitTitle: '拍照核验'
                    });
                  } else {
                    wx.reLaunch({
                      url: '../room/card?orderId=' + that.data.roomOrderId,
                    })
                  }
                });
              })
            })
          },
          fail(res) { }
        })
      }
    })
  },
  nextStep: function() {
    let that = this
    if (that.data.status == 1) {
      //连接成功 点击进入拍照
      that.setData({
        status: 3, //3显示摄像头拍照
        message: '请靠近门锁，进行拍照核验',
        submitTitle: '拍照核验' //提交按钮提示
      });
    } else if (that.data.status == 2) {
      that.setData({
        status: 0, //3显示摄像头拍照
        message: '正在检测蓝牙信号…',
        submitTitle: '正在检测到蓝牙信号，请靠近门锁' //提交按钮提示
      });
      that.connectionBluetooth();
    }else if(that.data.status==3){
      //拍照核验
      that.takePhoto();
    }
  },


  bindBluetoothDevices: function(bluetoothName) {
    let that = this;
    wx.openBluetoothAdapter({
      success(res) {
        console.log('蓝牙模块初始化成功')
        wx.startBluetoothDevicesDiscovery({
          success(res) {
            console.log("搜索设备：" + res)
            var result = JSON.stringify(res)
            console.log(result);
            setTimeout(function() {
              wx.getBluetoothDevices({
                success: function(res) {
                  console.log('发现设备', res)
                  var isconnection = false;
                  for (var i = 0; i < res.devices.length; i++) {
                    if (res.devices[i].name == bluetoothName) {
                      console.log('成功连接当前设备');
                      console.log('停止搜索蓝牙');
                      isconnection = true;
                      wx.stopBluetoothDevicesDiscovery({
                        success(res) {
                          console.log(res)
                        }
                      })
                      break;
                    }
                  }
                  if (isconnection) {
                    //成功
                    that.setData({
                      isSubmit: 2,
                      tishi: '蓝牙连接成功',
                      bindConfirmText: '开始核验'
                    });
                  } else {
                    //失败
                    that.setData({
                      isSubmit: 1,
                      tishi: '蓝牙连接失败',
                      bindConfirmText: '重新连接'
                    });
                  }
                },
                fail: function(res) {
                  console.log("发现设备错误", res)
                  that.setData({
                    isSubmit: 1,
                    tishi: '蓝牙连接失败',
                    bindConfirmText: '重新连接'
                  });
                }
              })
            }, 1000);
          },
          fail(result) {
            //失败
          }
        })
      },
      fail(result) {
        //失败
        that.setData({
          isSubmit: 1,
          tishi: '请开启蓝牙',
          bindConfirmText: '重新连接'
        });
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
    wx.stopBluetoothDevicesDiscovery();
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