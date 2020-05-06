'use strict'

import queryString from 'query-string';
import lodash from 'lodash';
import qiniu,{Auth,ImgOps,Conf,Rs,Rpc} from 'react-native-qiniu';
let config = require('./config');

let request = {};
request.get = (url, params) => {
  if(params){
    url = url + '?' + queryString.stringify(params);
  }
  return fetch(url)
    .then(response => response.json())
    // .then(responseData => {return responseData})
};

request.post = function(url, body, token=''){
  config.header.headers.token = token;
  var options = lodash.extend(config.header,{
    body: JSON.stringify(body)
  })
  console.log('options',options);
  return fetch(url, options)
  .then(response=>response.json())
};


//获取七牛Token
request.qiniuToken = (userToken) => {
  //获取七牛Token
  let url = config.domain.http + config.domain.qiniuToken;
  let params = "token="+userToken;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':'application/x-www-form-urlencoded',
    },
    body: params
  })
  .then(response => response.json())
}


//七牛视频上传
request.qiniuUpload =(videoResponse, qiniuToken, fileName)=>{
  console.log('videoResponse:',videoResponse);
  var headers = qiniu.getHeadersForChunkUpload(qiniuToken)
  let _time = parseInt(new Date().getTime());
  let suiji = Math.floor(Math.random() * 1000)
  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let formatedMonth = month < 10 ? '0' + month : month;
  let day = new Date().getDate();
  let path = 'uploads/'+year + formatedMonth + day + '/' + _time + suiji + fileName.substr(fileName.lastIndexOf("."));

  console.log('path:',path);
  let file = videoResponse;
  let key = path;
  let subscription;
  let config = {
    useCdnDomain: true,
    region: qiniu.region.z0
  };
  let putExtra = {
    fname: "",
    params: {},
    mimeType: null
  };
  // 调用sdk上传接口获得相应的observable，控制上传和暂停
  let observable = qiniu.upload(file, key, qiniuToken, putExtra, config);
  console.log('observable',observable);
  return observable;
}

module.exports = request
