'use strict'
var config = {
  header:{
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: ''
    },
  },
  domain:{
    http:'http://admin.ybphp.com/api/',
    video_list:'qiyue/video/index',
    video_zan:'qiyue/video/zan',
    video_detail:'qiyue/video/detail',
    video_comment:'qiyue/video/comment',
    video_add_comment:'qiyue/video/addComment',
    video_add:'qiyue/video/add',
    my_video:'qiyue/video/myVideo',
    my_fans:'qiyue/video/myFans',
    video_badge_count:'qiyue/video/getBadgeCount',
    login:'user/login',
    register:'user/register',
    resetPwd:'user/resetPwd',
    profile:'user/profile',
    sendCode:'sms/send',
    qiniuToken:'token/getQiniuToken',
    checkToken:'token/check',
    qiniuCdn:'http://app.ybphp.com/'
  },
}
module.exports = config
