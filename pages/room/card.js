var UIhelper = require('../../utils/uihelper.js')
const app = getApp()
Page({
  data: {
    roomOrderId: '',
    number: 0,
    status: 1, // 0开门成功 1开门中 2开门失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.orderId != undefined) {
      var roomInfo = app.globalData.currentRoomInfo[UIhelper.getDataIndex(options.orderId, app.globalData.currentRoomInfo)];
      that.setData({
        roomOrderId: options.orderId,
        roomName: roomInfo.roomName,
        predictCheckoutTime: roomInfo.predictCheckoutTime
      });

      //获取门锁信息
      UIhelper.getLockInfo(that.data.roomOrderId, function(result) {
        var bluetoothName = result.data.data.bluetoothName;
        var sn = result.data.data.sn;
        var data = result.data.data.data;
        that.setData({
          bluetoothName: bluetoothName,
          sn: sn,
          secret: data,
          unlockRecordId: result.data.data.unlockRecordId
        });
        that.bindOpenRoom();
      })
    }
  },
  daojishi: function(seconds) {
    let that = this
    if (seconds > 1 && that.data.status == 1) {
      seconds--;
      setTimeout(function() {
        that.daojishi(seconds);
      }, 1000);
    } else if (that.data.status == 1) {
      console.log('倒计时开门结束');
      that.setData({
        status:2
      });
      app.globalData.iotBleSdk.cancelTask(() => {
        console.log('停止蓝牙开门');
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  bindOpenRoom: function() {
    let that = this;
    var bluetoothName = that.data.bluetoothName;
    var sn = that.data.sn;
    var secret = that.data.secret;
    that.setData({
      isShowTip: false,
      status: 1
    });
   that.daojishi(10);
    var bluetoothRssiInfo = "{\"" + bluetoothName + "\":{\"max\":99,\"min\":1}}";
    var bluetoothRssi = JSON.parse(bluetoothRssiInfo)
    var r = app.globalData.iotBleSdk.startTask(
      ['' + bluetoothName + ''],
      bluetoothRssi, [{
        "sn": sn,
        bluetoothName: bluetoothName,
        commandKey: secret,
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
          if (step != 0) {
            that.setData({
              number: (step - 1) * 20
            });
          }
          console.error("步骤：" + step)
        },
        "uploadLog": function(logData) {
          console.warn(logData)
        }
      },
      (obj) => {
        that.feedbackResults(obj)
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
  feedbackResults: function(obj) {
    console.log('返回结果', obj);
    let that = this;
    if (obj.code == 0) {
      that.setData({
        status: 0
      });
      wx.showToast({
        title: '开门成功',
        icon: 'success',
        duration: 2000
      })
      if (obj.data.a) {
        that.bindBattery(obj.data.a);
      }
    } else {
      if (that.data.isShowTip) {
        return;
      }
      that.setData({
        isShowTip: true,
        status: 2
      });
      wx.showModal({
        title: '提示',
        content: obj.msg,
        showCancel: false,
        mask: false
      });

    }

  },
  bindBattery: function(data) {
    let that = this;
    var voltage = that.getBatteryLevel(data);
    console.log('电压值a为:' + battery);
    var battery = (voltage / (2500 * 4)).toFixed(2) * 100;
    var data = {
      status: 'SUCCESS',
      deviceLock: {
        deviceName: that.data.bluetoothName,
        sn: that.data.sn,
        voltage: voltage,
        battery: battery
      }
    };
    UIhelper.uploadBattery(that.data.unlockRecordId, data, function(res) {
      console.log('开门上传日志', res);
    })
  },
  getBatteryLevel: function(data) {
    var arrs = data.split(" ");
    if (arrs.length < 4) {
      return -1;
    }
    return parseInt(arrs[3] + arrs[2], 16);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  goHome:function(){
    wx.reLaunch({
      url: '../main/index',
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