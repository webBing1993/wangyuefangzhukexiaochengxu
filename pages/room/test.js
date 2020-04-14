var blePlugin = requirePlugin('bleSdk-plugin')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowTip: false
  },
  bindBluetoothDevices: function() {
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
                    if (res.devices[i].name == 'fortrun1250B0000050') {
                      console.log('成功连接当前设备');
                      console.log('停止搜索蓝牙');
                      isconnection = true;
                      wx.stopBluetoothDevicesDiscovery({
                        success(res) {
                          console.log(res)
                        }
                      })
                      return;
                    }
                  }
                  if (isconnection) {
                    //成功
                  } else {
                    //失败

                  }
                },
                fail: function(res) {
                  console.log("发现设备错误", res)
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

      }
    })
  },

  bindOpenRoom: function() {
    let that = this;
    that.setData({
      isShowTip: false
    });
    //搜索当前门锁蓝牙
    var bleSdk = blePlugin.initBleSdk({
      debug: true, //是否打开调试
      retryCount: 3, //操作设备失败的重试次数
      connectionTimeout: 30, //尝试与设备建立连接的超时时间
    });
    var r = bleSdk.startTask(
      ['fortrun1250B0000050'], {
        "fortrun1250B0000050": {
          "max": 99,
          "min": 1
        }
      }, [{
        "sn": "DF11250B0000050",
        bluetoothName: "fortrun1250B0000050",
        commandKey: "SlIQgBczseiqzI+xS0fkIM147XLORgVGYECX8L2LqGX50DchZnAFt+/YKz/ndzMh",
        lastLogTimestamp: 1540294526000
      }],
      '01',
      null, {
        "controlPara": 0x00,
        "fixDeviceRtc": function(random, sn, func) {
          console.warn(random);
          console.warn(sn)
          func(null, null)

        },
        "stepFunc": function(step) {
          console.error("步骤：" + step)
        },
        "uploadLog": function(logData) {
          console.warn(logData)
        }
      },
      (obj) => {
        that.feedbackResults(obj, that)
      },
      function() {
        return true;
      }
    )
  },
  ab2hext: function(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function(bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  bindBattery: function(data) {
    let that = this;
    var voltage = that.getBatteryLevel(data);
    var battery = (voltage / (2500 * 4)).toFixed(2) * 100;
    console.log('电压值a为:' + voltage + '  电量:' + battery);
  },
  feedbackResults: function(obj) {
    let that = this;
    if (obj.code == 0) {
      wx.showToast({
        title: '开门成功',
        icon: 'success',
        duration: 2000
      })
    } else {
      if (that.data.isShowTip) {
        return;
      }
      that.setData({
        isShowTip: true
      });
      wx.showModal({
        title: '提示',
        content: obj.msg,
        showCancel: false,
        mask: false
      });
      if (obj.data.a) {
        that.bindBattery(obj.data.a);
      }
    }
  },
  getBatteryLevel: function(data) {
    var arrs = data.split(" ");
    if (arrs.length < 4) {
      return -1;
    }
    return parseInt(arrs[3] + arrs[2], 16);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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