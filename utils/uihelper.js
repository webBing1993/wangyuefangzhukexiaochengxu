//变量-请求方式
var methodGet = 'GET';
var methodPost = 'POST';
var methodPut = 'PUT';
var appId = 'wx6e877449e31bf77f';
//判断当前登录用户和订单是否一致 不一致不允许增加、修改、删除预登记人
var jsCodeUserId = '';
var tokenCode='';
var header = {};
//接口服务地址
var baseService = 'https://wqt.fortrun.cn/q/master/homestay-tenant/';
//var baseService ="http://192.168.2.105:8930/";
//网络请求接口
var getRequest = function(url, data, method, callbackFun) {
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  wx.request({
    url: url,
    method: method,
    data: data,
    header: header,
    // header: {
    //   'X-auth-token': 'a1916287-cdb8-4fc4-8416-3a1ccb3bee1f'
    // },
    success: function(res) {
      console.log('接口返回结果：' + res);
      if (res.data.errcode == 0) {
        if (callbackFun != null) {
          callbackFun(res);
        }
      } else if (res.data.errcode == '100006' || res.data.errcode == 100006) {
        //登录过期
        againLogin(url, data, method, callbackFun);
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errmsg,
          showCancel: false,
          mask: false
        });
      }
    },
    fail: function(res) {
      wx.showModal({
        title: '提示',
        content: '网络异常,请稍后重试!',
        showCancel: false,
        mask: false
      });
    },
    complete: function() {
      wx.hideLoading();
    }
  })
}
var getRoomsRequest = function (url, data, method, roomheader, callbackFun) {
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  wx.request({
    url: url,
    method: method,
    data: data,
    header: roomheader,
    success: function (res) {
      console.log('接口返回结果：' + res);
      if (res.data.errcode == 0) {
        if (callbackFun != null) {
          callbackFun(res);
        }
      } else if (res.data.errcode == '100006' || res.data.errcode == 100006) {
        //登录过期
        againLogin(url, data, method, callbackFun);
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errmsg,
          showCancel: false,
          mask: false
        });
      }
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '网络异常,请稍后重试!',
        showCancel: false,
        mask: false
      });
    },
    complete: function () {
      wx.hideLoading();
    }
  })
}

var getRequestJsCode = function(url, data, method, callbackFun) {
  wx.request({
    url: url,
    method: method,
    data: data,
    success: function(res) {
      console.log('接口返回结果：' + res);
      if (res.data.errcode == 0) {
        var token = res.header['X-auth-token'];
        console.log('token:' + token);
        setToken(token);
        if (res.data.data.loginStatus != 'ANONYMOUS') {
          if (callbackFun != null) {
            callbackFun(res);
          }
        }
      } else {}
    },
    fail: function(res) {},
    complete: function() {

    }
  })
}

//重新登录
var againLogin = function(url, data, method, callbackFun) {
  getJsCodeLogin(function(result) {
    //登录成功 重新请求之前接口
    var token = result.header['X-auth-token'];
    console.log('token:' + token);
    setToken(token);
    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      success: function(res) {
        console.log('接口返回结果：' + res);
        if (res.data.errcode == 0) {
          if (callbackFun != null) {
            callbackFun(res);
          }
        } else if (res.data.errcode == '100006' || res.data.errcode == 100006) {
          //重新登录 界面
          wx.reLaunch({
            url: '../user/login?relogin=true',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errmsg,
            showCancel: false,
            mask: false
          });
        }
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: '网络异常,请稍后重试!',
          showCancel: false,
          mask: false
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    })
  })
}
//上传图片
var uploadTempPic = function(url, imagePath, callbackFun) {
  wx.uploadFile({
    url: url,
    filePath: imagePath,
    file: imagePath,
    name: 'file',
    header: header,
    success(res) {
      var result = JSON.parse(res.data)
      if (result.errcode == 0) {
        callbackFun(result);
      } else {
        showMessage(result.errmsg);
      }
    },
    fail(res) {
      wx.showModal({
        title: '提示',
        content: '网络异常,请稍后重试!',
        showCancel: false,
        mask: false
      });
    }
  })
}

//发送验证码登录短信
var authSms = function(mobile, callbackfunc) {
  var url = baseService + 'auth/sms';
  var data = {
    phoneNumber: mobile,
    smsCode: "",
    zone: ""
  };
  getRequest(url, data, methodPost, callbackfunc)
}

//根据微信手机号授权登录
var getwxPhoneNumberLogin = function(iv, encryptedData, callbackfunc) {
  // wx.login({
  //   success: res => {
  //   }
  // })
  var url = baseService + 'auth/wx/phoneNumber/login';
  var data = {
    appId: appId,
    iv: iv,
    encodeData: encryptedData
  };
  getRequest(url, data, methodPost, callbackfunc)

}

var getJsCodeLogin = function(callbackfunc) {
  wx.login({
    success: res => {
      var url = baseService + 'auth/wx/jscode/login';
      var data = {
        appId: appId,
        jscode: res.code
      };
      getRequestJsCode(url, data, methodPost, callbackfunc)
    }
  })
}

var getUserInfo = function(callbackfunc) {
  var url = baseService + 'auth/info';
  var data = {};
  getRequest(url, data, methodGet, callbackfunc)
}
//短信验证码登录
var authSmsLogin = function(mobile, smscode, callbackfunc) {
  wx.login({
    success: res => {
      var url = baseService + 'auth/sms/login';
      var data = {
        phoneNumber: mobile,
        smsCode: smscode,
        jscode: res.code,
        appId: appId,
        zone: ""
      };
      getRequest(url, data, methodPost, callbackfunc)
    }
  })

}

//根据手机号查询订单
var getOrderActive = function(callbackfunc) {
  var url = baseService + 'order/active';
  var data = {};
  getRequest(url, data, methodGet, callbackfunc)
}

//查询登记人
var getRoomOrderGuest = function(roomOrderId, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/guest';
  var data = {}
  getRequest(url, data, methodGet, callbackfunc)
}

//入住人登记 如果ID为空,则为添加数据. 如果ID不为空,则为修改数据.如果删除为true,则为删除数据.
var saveRoomOrderGuest = function(roomOrderId, data, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/guest';
  getRequest(url, data, methodPut, callbackfunc)
}

//单个获取已登记入住人
var getGuest = function(roomOrderId, roomOrderGuestId, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/guest/' + roomOrderGuestId;
  var data = {}
  getRequest(url, data, methodGet, callbackfunc)
}

//入住人登记核验
var guestIdentityCheck = function(roomOrderId, roomOrderGuestId, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/guest/' + roomOrderGuestId + '/check';
  var data = {}
  getRequest(url, data, methodPut, callbackfunc)
}

//申请退房
var checkOutApply = function(roomOrderId, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/checkout/apply';
  var data = {
    roomOrderId: roomOrderId
  }
  getRequest(url, data, methodPut, callbackfunc)
}

//查询门锁信息
var getLockInfo = function(roomOrderId, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/lock';
  var data = {};
  getRequest(url, data, methodGet, callbackfunc)
}

//绑定订单到当前用户
var getRoomBind = function(roomOrderId, callbackfunc) {
  var url = baseService + 'order/' + roomOrderId + '/bind';
  var data = {};
  getRequest(url, data, methodPut, callbackfunc)
}

//上传图片
var uploadFile = function(imagePath, callbackfunc) {
  var url = baseService + 'common/temp/pic';
  uploadTempPic(url, imagePath, callbackfunc);
}

//上传电量
var uploadBattery = function(unlockRecordId, data, callbackfunc) {
  var url = baseService + 'room/lock/use/record/' + unlockRecordId;
  getRequest(url, data, methodPost, callbackfunc)
}

//退出登录
var getLogout = function(callbackfunc) {
  var url = baseService + 'auth/logout';
  var data = {};
  getRequest(url, data, methodGet, callbackfunc)
}

//获取名族数据
var getNation = function(callbackfunc) {
  var url = baseService + 'common/dict/nation';
  var data = {};
  getRequest(url, data, methodGet, callbackfunc)
}

//根据经纬度查询房源信息
var getSearchRoom = function(page,pageSize,data, callbackfunc) {
  var url = baseService + 'roomGroup/search';
  var header = {
    'X-auth-token': tokenCode,
    'X-Current-Page': page,
    'X-Page-Size': pageSize,
  };
  getRoomsRequest(url, data, methodPost, header, callbackfunc)
}

//提示框
var showMessage = function(message) {
  wx.showModal({
    title: '提示',
    content: message,
    showCancel: false,
    mask: false
  });
}
var setToken = function(tokenId) {
  if (tokenId != undefined) {
    tokenCode = tokenId;
    header = {
      'X-auth-token': tokenId
    };
  }
}
var setTokenClear = function() {
  header = {};
}
var getJsCodeUserId = function() {
  return jsCodeUserId;
}
var setJsCodeUserId = function(userId) {
  jsCodeUserId = userId;
}
var appendZero = function(obj) {
  if (obj < 10) return "0" + "" + obj;
  else return obj;
}
var formatDate = function(now) {
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  return year + "-" + appendZero(month) + "-" + appendZero(date) + " " + appendZero(hour) + ":" + appendZero(minute) + ":" + appendZero(second);
}
var getWeekDay = function(date1) {
  var date = date1.substring(0, 4) + "-" + date1.substring(5, 7) + "-" + date1.substring(8, 10)
  var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  var myDate = new Date(Date.parse(date));
  console.log('getWeekDay' + myDate);
  return weekDay[myDate.getDay()];
}
var getNumberOfDays = function(date1, date2) {
  console.log('getNumberOfDays ' + date1 + '     ' + date2);
  //date1：开始日期，date2结束日期
  //格式化时间 时分秒为0
  var startDate = date1.substring(0, 4) + "-" + date1.substring(5, 7) + "-" + date1.substring(8, 10);
  var endDate = date2.substring(0, 4) + "-" + date2.substring(5, 7) + "-" + date2.substring(8, 10);
  var a1 = Date.parse(new Date(startDate));
  var a2 = Date.parse(new Date(endDate));
  var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));
  //核心：时间戳相减，然后除以天数
  console.log('getNumberOfDays' + day);
  return day
}

var formatDateTime = function(date) {
  var time = date.replace(/-/g, ':').replace(' ', ':');
  time = time.split(':');
  return new Date(time[0], (time[1] - 1), time[2], time[3], time[4], time[5]);
}

var getDataIndex = function(id, data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      return i;
    }
  }
}

function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.width; //图片原始宽  
  var originalHeight = e.height; //图片原始高  
  var originalScale = originalHeight / originalWidth; //图片高宽比  

  console.log('原始宽: ' + originalWidth)
  console.log('原始高: ' + originalHeight)
  console.log('宽高比' + originalScale)
  //获取屏幕宽高  
  wx.getSystemInfo({
    success: function(res) {
      // canvas 基础宽高调为 2 倍，避免图片压缩程度过高导致图片字体显示不清楚
      var windowWidth = res.windowWidth * 2;
      var windowHeight = res.windowHeight * 2;
      var windowscale = windowHeight / windowWidth; //屏幕高宽比  

      // 图片尺寸大于设备
      if (originalWidth > res.windowWidth || originalHeight > res.windowHeight) {
        if (originalScale < windowscale) { //图片高宽比小于屏幕高宽比  
          //图片缩放后的宽为屏幕宽  
          imageSize.imageWidth = windowWidth;
          imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
        } else { //图片高宽比大于屏幕高宽比
          //图片缩放后的高为屏幕高  
          imageSize.imageHeight = windowHeight;
          imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
        }
      } else {
        imageSize.imageHeight = originalHeight;
        imageSize.imageWidth = originalWidth;
      }
    }
  })
  console.log('缩放后的宽: ' + imageSize.imageWidth)
  console.log('缩放后的高: ' + imageSize.imageHeight)
  return imageSize;
}
/**
 * 去掉字符串头尾空格
 */
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 身份证号验证
 */
function checkIdCard(idCard) {
  idCard = trim(idCard.replace(/ /g, "")); //去掉字符串头尾空格
  if (idCard.length == 15) {
    return isValidityBrithBy15IdCard(idCard); //进行15位身份证的验证
  } else if (idCard.length == 18) {
    var a_idCard = idCard.split(""); // 得到身份证数组
    if (isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(a_idCard)) { //进行18位身份证的基本验证和第18位的验证
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * 判断身份证号码为18位时最后的验证位是否正确
 * @param a_idCard 身份证号码数组
 * @return
 */
function isTrueValidateCodeBy18IdCard(a_idCard) {
  var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]; // 加权因子
  var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  var sum = 0; // 声明加权求和变量
  if (a_idCard[17].toLowerCase() == 'x') {
    a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
  }
  for (var i = 0; i < 17; i++) {
    sum += Wi[i] * a_idCard[i]; // 加权求和
  }
  var valCodePosition = sum % 11; // 得到验证码所位置
  if (a_idCard[17] == ValideCode[valCodePosition]) {
    return true;
  } else {
    return false;
  }
}

/**
 * 验证18位数身份证号码中的生日是否是有效生日
 * @param idCard 18位书身份证字符串
 * @return
 */
function isValidityBrithBy18IdCard(idCard18) {
  var year = idCard18.substring(6, 10);
  var month = idCard18.substring(10, 12);
  var day = idCard18.substring(12, 14);
  var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
  // 这里用getFullYear()获取年份，避免千年虫问题
  if (temp_date.getFullYear() != parseFloat(year) ||
    temp_date.getMonth() != parseFloat(month) - 1 ||
    temp_date.getDate() != parseFloat(day)) {
    return false;
  } else {
    return true;
  }
}

/**
 * 验证15位数身份证号码中的生日是否是有效生日
 * @param idCard15 15位书身份证字符串
 * @return
 */
function isValidityBrithBy15IdCard(idCard15) {
  var year = idCard15.substring(6, 8);
  var month = idCard15.substring(8, 10);
  var day = idCard15.substring(10, 12);
  var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
  // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
  if (temp_date.getYear() != parseFloat(year) ||
    temp_date.getMonth() != parseFloat(month) - 1 ||
    temp_date.getDate() != parseFloat(day)) {
    return false;
  } else {
    return true;
  }
}
module.exports = {
  authSms: authSms,
  authSmsLogin: authSmsLogin,
  getwxPhoneNumberLogin: getwxPhoneNumberLogin,
  getJsCodeLogin: getJsCodeLogin,
  getUserInfo: getUserInfo,
  getOrderActive: getOrderActive,
  saveRoomOrderGuest: saveRoomOrderGuest,
  getRoomOrderGuest: getRoomOrderGuest,
  getGuest: getGuest,
  guestIdentityCheck: guestIdentityCheck,
  getLockInfo: getLockInfo,
  checkOutApply: checkOutApply,
  uploadBattery: uploadBattery,
  uploadFile: uploadFile,
  getLogout: getLogout,
  getRoomBind: getRoomBind,
  getNation: getNation,
  getSearchRoom: getSearchRoom,
  setToken: setToken,
  setTokenClear: setTokenClear,
  formatDate: formatDate,
  getWeekDay: getWeekDay,
  getNumberOfDays: getNumberOfDays,
  getDataIndex: getDataIndex,
  getJsCodeUserId: getJsCodeUserId,
  setJsCodeUserId: setJsCodeUserId,
  showMessage: showMessage,
  formatDateTime: formatDateTime,
  imageUtil: imageUtil,
  checkIdCard: checkIdCard
}