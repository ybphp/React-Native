import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    Platform,
    View
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { SafeAreaView } from 'react-navigation';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import {ListRow, Input, Button, Label, Toast} from 'teaset';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import ProgressBar from 'react-native-progress/Bar';
import ProgressPie from 'react-native-progress/Pie';
import ProgressCircle from 'react-native-progress/Circle';
import qiniu,{Auth,ImgOps,Conf,Rs,Rpc} from 'react-native-qiniu';

//加载配置信息
var config = require('../common/config');
var request = require('../common/request');

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');


export default class Edit extends Component {
    constructor(props) {
        super(props);
        //当前页
        this.page = 1
        //状态
        this.state = {
            // 列表数据结构
            user: '',
            isPost:false,
            videoName:'',
            videoStatus:1,
            videoDesc:'',
            videoStatusTypes:[
              {label: '公开', value: 1 },
              {label: '私密', value: 2 }
            ],
            modalVisible:false,
            qiniuToken:'',
            qiniuUrl:'',
            qiniuCdn:'',
            previewVideo: null,
            repeat:true,
            rate: 1,
            volume: 1,
            muted: false,
            resizeMode: 'contain',
            duration: 0.0,
            currentTime: 0.0,
            paused: false,
            videoLoaded:false,
            videoPlaying:false,
            videoError:false,
            videoUploaded:false,
            videoUploading:false,
            videoEnding:false,
            progress: 0,
            animated: false,
            indeterminate:false
        }
    }

    componentDidMount() {
        //读取本地存储用户信息
        this._retrieveData();
    };

    //读取数据
    _retrieveData = async () => {
      let that = this;
      try {
        let user = await AsyncStorage.getItem('user');
        if (user !== null) {
          user = JSON.parse(user);
          that.setState({
            user:user,
            visible:false,
            msg:'',
            isPost:false,
          });
          //获取七牛Token
          let requestData = request.qiniuToken(user.token);
          requestData.then(data => {
            console.log('qiniuDataRequest:',data);
            if(data.code == 1){
              that.setState({
                qiniuToken:data.data.multipart.token,
                qiniuUrl:data.data.uploadurl,
                qiniuCdn:data.data.cdnurl
              })
            }else{
              Alert.alert("尴尬了，获取七牛Token失败了！要不重新登录试试吧");
              //这里可能存在用户token失效，可以让用户重新登录试试
              this.props.navigation.navigate('Login');
            }
          }).catch(error => {
            console.error(error);
          });
        }
       } catch (error) {
         // Error retrieving data
         console.log('usererror:', error);
       }
    }

    _pickVideo = () =>{
      // this.props.navigation.navigate('ImagePickerDemo')
      let that = this;
      const options = {
        title: '选择视频',
        cancelButtonTitle:'取消',
        takePhotoButtonTitle:'录制10秒视频',
        chooseFromLibraryButtonTitle:'选择已有视频',
        mediaType:'video',
        videoQuality:'medium',   //视频质量
        durationLimit:10,     //视频录制时间
        // storageOptions: {
        //   skipBackup: true,
        //   path: 'images',
        // }
      };
      ImagePicker.showImagePicker(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const source = { uri: response.uri };
          //保存视频信息
          that.setState({
            previewVideo: response
          });
        }
      });
    }

    //上传视频和信息
    _postVideo = () =>{
      let that=this;
      let qiniuToken = that.state.qiniuToken;
      let qiniuUrl = that.state.qiniuUrl;
      //构建表单
      let formData = new FormData();
      let file = {};
      let fileName = '';
      let response = this.state.previewVideo;
      if(Platform.OS == 'android'){
        file = { uri:response.uri, type:'application/octet-stream', name: response.path }
        fileName = response.path;
      }else{
        file = response;
        fileName = response.fileName;
      }
      let qiniuUrl = that.state.qiniuUrl;
      //构建表单
      let formData = new FormData();
      let _time = parseInt(new Date().getTime());
      let suiji = Math.floor(Math.random() * 1000)
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      let formatedMonth = month < 10 ? '0' + month : month;
      let day = new Date().getDate();
      let path = 'videos/'+year + formatedMonth + day + '/' + _time + suiji + fileName.substr(fileName.lastIndexOf("."));
      formData.append("file", { uri:file, type:'application/octet-stream', name: path });
      formData.append("key", path);
      formData.append("token", this.state.qiniuToken);
      fetch(qiniuUrl, {
          method: 'POST',
          headers: {},
          body: formData,
          contentType: false,
          processData: false,
      }).then((response) => response.json())
        .then((responseData) => {
          console.log('responseData',responseData);
          // let params = "avatar="+that.state.qiniuCdn+responseData.key;
          // that._submitProfile(params);
          // that.setState({
          //   avatarSource:that.state.qiniuCdn+responseData.key
          // })
        })
        .catch((error) => {
            console.log('error', error);
        });
      // let file = {};
      // let fileName = '';
      // let response = this.state.previewVideo;
      // if(Platform.OS == 'android'){
      //   file = { uri:response.uri, type:'application/octet-stream', name: response.path }
      //   fileName = response.path;
      // }else{
      //   file = response;
      //   fileName = response.fileName;
      // }
      //
      // let that=this;
      // console.log('response:',response);
      // console.log('file:', file);
      // //上传视频
      // this.setState({
      //   isPost:true
      // }, function(){
      //   var config = new qiniu.conf.Config();
      // // 空间对应的机房
      // config.zone = qiniu.zone.Zone_z0;
      //   var localFile = response.uri;
      //   var formUploader = new qiniu.form_up.FormUploader(config);
      //   var putExtra = new qiniu.form_up.PutExtra();
      //   var key=fileName;
      //   // 文件上传
      //   formUploader.putFile(this.state.qiniuToken, key, localFile, putExtra, function(respErr,
      //     respBody, respInfo) {
      //     if (respErr) {
      //       throw respErr;
      //     }
      //     if (respInfo.statusCode == 200) {
      //       console.log(respBody);
      //     } else {
      //       console.log(respInfo.statusCode);
      //       console.log(respBody);
      //     }
      //   });
        // let observable = request.qiniuUpload(file, this.state.qiniuToken, fileName);
        // console.log('observable',observable);
        // // 上传进度
        // let next = (response) =>{
        //   let total = response.total;
        //   console.log("qiniuresponse：",response);
        //   that.setState({
        //     videoUploading:true,
        //     animated:true,
        //     progress:(total.percent).toFixed(2) / 100,
        //   })
        //   console.log("进度：",that.setState);
        //   if(total == 100){
        //     that.setState({
        //       videoUploading:false,
        //       videoUploaded:true,
        //       progress:1
        //     })
        //   }
        // }
        //
        // //上传报错信息
        // let error = (err) =>{
        //   that.setState({
        //     modalVisible:false,
        //     isPost:false
        //   })
        //   console.log('err:', err);
        // }
        //
        // let complete = (complete) =>{
        //   //更新信息到我们的服务器
        //   this._addVideo(complete.key);
        //   console.log('complete:', complete);
        // }
        //
        // var subscription = observable.subscribe(next, error, complete)
        // //完成后获取信息
        // console.log('subscription',subscription);
      // })
    }

    _addVideo = (videoPath) =>{
      let url = config.domain.http + config.domain.video_add;
      let that=this;
      let token= this.state.user.token
      let body = {
        videoname: this.state.videoName,
        videodesc: this.state.videoDesc,
        videostatus: this.state.videoStatus,
        videopath: videoPath
      }
      this.setState({
        isPost:true
      }, function(){
        request.post(url, body, token)
        .then(data => {
          console.log('sucessData:',data);
          if(data.code == 1){
            //关闭弹窗
            that.setState({
              modalVisible:false,
              animated:false,
              isPost:false,

            });
            // this.props.navigation.navigate('Index')
            Toast.smile(data.msg);
          }else{
            that.setState({
              modalVisible:false,
              isPost:false,
              previewVideo:''
            })
            this.props.navigation.navigate('Video')
            Toast.sad(data.msg)
          }
        })
        .catch((err)=>{
            console.log(err);
            that.setState({
              modalVisible:false,
              isPost:false,
              previewVideo:''
            })
            Toast.say(err);
          })
        })
    }

    render() {
      //进度条
      const flexCompleted = this.getCurrentTimePercentage() * 100;
      const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;
        return (
          <SafeAreaView style={styles.container}>
            <View style={styles.page}>
              {
                this.state.previewVideo ?
                <View style={styles.videoContainer}>
                  <View style={styles.videoBox}>
                    <Video source={{uri: this.state.previewVideo.uri}}  // Can be a URL or a local file.
                       ref={(ref) => {
                         this.player = ref
                       }}                                      // Store reference
                       onBuffer={this.onBuffer}                // Callback when remote video is buffering
                       onError={this.videoError}               // Callback when video cannot be loaded
                       rate={this.state.rate}
                       paused={this.state.paused}
                       volume={this.state.volume}
                       muted={this.state.muted}
                       resizeMode={this.state.resizeMode}
                       onLoad={this.onLoad}
                       onProgress={this.onProgress}
                       onEnd={this.onEnd}
                       style={styles.video} />
                     {/* 暂停播放 */}
                     {
                       this.state.videoLoaded && this.state.videoPlaying ?
                       <TouchableOpacity onPress={this.onPause} style={styles.pauseBtn}>
                         {
                           this.state.paused ?
                           <Icon onPress={this._resume} name='ios-play' size={50} style={styles.resumeIcon} />
                           : <Text></Text>
                         }
                       </TouchableOpacity>
                       : null
                     }

                  </View>

                  {/* 进度条 */}
                  <View style={styles.progress}>
                      <View style={[styles.innerProgressCompleted, {flex: flexCompleted}]}/>
                      <View style={[styles.innerProgressRemaining, {flex: flexRemaining}]}/>
                  </View>
                  <View style={styles.submitBox}>
                    <Button type='secondary' size='md' title='完善视频信息' onPress={() => {this.setModalVisible(true)}} />
                  </View>
                </View>
                :
                <TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo}>
                  <View style={styles.imageBox}>
                    <Image source={require('../../img/qiyue_logo.png')} style={styles.uploadLogo} />
                  </View>
                  <View style={styles.uploadBox}>
                    <Text style={styles.uploadTitle}>点我上传视频</Text>
                    <Text style={styles.uploadDesc}>建议时常不超过20秒！</Text>
                  </View>
                </TouchableOpacity>
              }

            </View>
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                  this.setModalVisible(false);
                }}
              >
                <View style={styles.modalContainer}>
                  <Icon
                    onPress={this._closeModal}
                    name='ios-close'
                    style={styles.closeIcon}
                    />
                    <View style={styles.listHeader}>
                      <View style={styles.modelItem}>
                        <Text style={styles.modelText}>视频名称：</Text>
                        <TextInput
                          placeholder="输入视频名称，2~20个字符！"
                          style={styles.modelTextInput}
                          onChangeText={(videoName) => this.setState({videoName})}
                          defaultValue={this.state.videoName}
                        />
                      </View>
                      <View style={{height: 1, backgroundColor: '#999999'}}/>

                      <View style={styles.modelItem}>
                          <Text style={styles.modelText}>隐私设置：</Text>
                          <RadioForm
                            radio_props={this.state.videoStatusTypes}
                            initial={0}
                            formHorizontal={true}
                            labelHorizontal={true}
                            buttonColor={'#2196f3'}
                            animation={true}
                            initial={0}
                            onPress={(videoStatus) => {this.setState({videoStatus:videoStatus})}}
                          />
                      </View>
                      <View style={{height: 1, backgroundColor: '#999999'}}/>
                      <View style={styles.modelItem}>
                        <Text style={styles.modelText}>视频简介：</Text>
                        <TextInput
                          placeholder="视频简介"
                          style={styles.modelTextInput}
                          onChangeText={(videoDesc) => this.setState({videoDesc})}
                          defaultValue={this.state.videoDesc}
                        />
                      </View>
                    </View>
                    {this.state.animated
                      ?
                      <ProgressCircle
                        animated={this.state.animated}
                        style={styles.progressC}
                        indeterminate={false}
                        size={100}
                        showsText={true}
                        progress={this.state.progress}
                      />
                    : <Text></Text>
                  }
                    <Button title='发布视频' size='md' type='primary' style={styles.submitBtn} onPress={this._postVideo} />
                </View>


              </Modal>
          </SafeAreaView>
        );
    }

    setModalVisible(visible) {
      this.setState({ modalVisible: visible });
    }

    _closeModal = () => {
      this.setModalVisible(false)
    }

    onLoad = (data) => {
        this.setState({duration: data.duration});
        console.log(data.duration + "xxx");
    };

    onProgress = (data) => {
        this.setState({
          currentTime: data.currentTime,
          videoLoaded:true,
          videoPlaying:true
        });
    };

    onEnd = () => {
        this.setState({
          paused: true,
          videoEnding:true
        });
        //从0秒重新播放
        // this.player.seek(0);
    };

    onPause = () => {
      if(!this.state.paused){
        this.setState({paused:true});
      }
    };

    onError =() =>{
      this.setState({videoError:true});
    };

    _resume =() =>{
      console.log('_resume',false);
      if(this.state.paused){
        this.setState({
          paused:false
        });
      }
      if(this.state.videoEnding){
        //从0秒重新播放
        this.player.seek(0);
        this.setState({
          videoEnding:false
        });
      }
    }
    onAudioBecomingNoisy = () => {
        this.setState({paused: true})
    };

    onAudioFocusChanged = (event: { hasAudioFocus: boolean }) => {
        this.setState({paused: !event.hasAudioFocus})
    };

    getCurrentTimePercentage() {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        }
        return 0;
    };


    /**
     * 分割线
     */
    _separator() {
        return <View style={{height: 1, backgroundColor: '#999999'}}/>;
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolBar:{
    flexDirection: 'row',
    paddingTop:12,
    paddingBottom:12,
    backgroundColor:"#ee735c",
  },
  toolBarTitle:{
    flex:1,
    fontSize:16,
    color:"#fff",
    textAlign:"center",
    fontWeight:'400',
  },
  toolBarEdit:{
    fontSize:14,
    color:"#fff",
    textAlign:"right",
    paddingRight:10
  },
  page:{
    flex:1,
    alignItems:'center',
  },
  uploadContainer:{
    marginTop:90,
    width:width-40,
    paddingBottom:10,
    borderColor:'#ee735c',
    justifyContent:'center',
    borderRadius:6,
    borderWidth: 2,
    backgroundColor:'#fff',
  },
  uploadTitle:{
    marginBottom:10,
    textAlign:'center',
    fontSize:16,
    color:"#000"
  },
  uploadDesc:{
    color:'#999',
    textAlign:'center',
    fontSize:12,
  },
  uploadLogo:{
    width:110,
    resizeMode:'contain'
  },
  imageBox:{
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },
  uploadBox:{
    marginTop:50,
  },
  videoContainer:{
    flex:1,
    width:width,
    justifyContent:'center',
    alignItems:'flex-start',
  },
  videoBox:{
    width:width,
    height:height*0.6
  },
  video:{
    width:width,
    height:height*0.6,
    backgroundColor:'#333'
  },
  pauseBtn:{
    position:'absolute',
    top:0,
    left:0,
    width:width,
    height:300,
  },

  resumeIcon:{
    position:'absolute',
    top:180,
    left: width/2 -30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#ed7b66',
  },
  progress: {
      flex: 1,
      flexDirection: 'row',
      borderRadius: 3,
      overflow: 'hidden',
  },
  progressC:{
    position:'absolute',
    top:height/1.5,
    left: width/2.7 ,
    width:100,
    height:100,
  },
  innerProgressCompleted: {
      height: 20,
      backgroundColor: '#cccccc',
  },
  innerProgressRemaining: {
      height: 20,
      backgroundColor: '#2C2C2C',
  },
  modalContainer:{
    flex:1,
    paddingTop:45,
    backgroundColor:'#fff'
  },
  closeIcon:{
    alignSelf:'center',
    fontSize:30,
    color:'#ccc'
  },
  submitBox:{
    flex:1,
    width:width-20,
    marginTop:30,
    marginLeft:10,
    marginRight:10
  },
  modelItem:{
    flexDirection: 'row',
    paddingTop:10,
    paddingBottom:10,
  },
  modelText:{
    textAlign:"left",
    paddingTop:10,
    paddingBottom:10
  },
  modelTextInput:{
    textAlign:"left",
    paddingTop:6,
    paddingBottom:10,
    marginLeft:20
  },
  listHeader:{
    width:width,
    marginLeft:10,
    marginBottom:20
  },
  submitBtn:{
    borderWidth:1,
    borderColor:'#eee',
    borderRadius:4,
    marginTop:20,
    marginLeft:10,
    marginRight:10,
  }
});
