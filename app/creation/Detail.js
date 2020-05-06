import React, { Component } from "react";

import {
  FlatList,
  TouchableOpacity,
  TextInput, Modal,
  ScrollView,
  ImageBackground,
  TouchableHighlight,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
  View
} from "react-native";

import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import {ListRow, Input, Button, Label, Toast} from 'teaset';
import { withNavigation } from 'react-navigation';

var config = require('../common/config');
var request = require('../common/request');

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video:this.props.navigation.getParam('item', 'NO-Item'),
      user:this.props.navigation.getParam('user', 'NO-User'),
      repeat:true,
      rate: 1,
      volume: 1,
      muted: false,
      resizeMode: 'contain',
      duration: 0.0,
      currentTime: 0.0,
      paused: false,
      animating:true,
      videoLoaded:false,
      videoPlaying:false,
      videoError:false,
      commentPage:1,
      commentData:[],
      text:'',
      modalVisible: false,
      isPost:false,
      videoEnding:false
    };
    this._fetchData = this._fetchData.bind(this);
    this._createListHeader = this._createListHeader.bind(this);
  }
  componentWillMount() {
    // this._fetchDetail();
  }
  componentDidMount() {
    this._fetchData();
    this._getDetail();
  }

  //获取视频详情
  _getDetail = () => {
    var url = config.domain.http + config.domain.video_detail
    let that = this;
    var body = {
      video_id: that.state.video.id,
      token:that.state.user.token
    }
    request.get(url, body)
    .then(function(data){
      console.log('Detaildata',data);
      if(data.code === 1){
        that.setState({
          video: data.data
        });
      }else{
        Toast.sad('获取视频详情失败！')
        //可以登出，暂时也不做
      }
    })
  }

  /**
   * 评论
   */
  _fetchData(){
    //这里有大坑：在success里，this指向的是jquery对象，而不是react组件。在get之前先将react组件存储一下，然后再调用
    const that = this;
    let video = this.state.video;
    let user = this.state.user;
    let url = config.domain.http + config.domain.video_comment;
    let body = {
      video_id: video.id,
      page: this.state.page,
      token:user.token
    }
    request.get(url, body)
    .then(function(data){
      if(data.code === 1){
        that.setState({
          commentData: data.data,
        });
      }else{
        that.setState({
          commentData: null,
        });
        Toast.sad('请求评论失败！')
      }
    })
    .catch((error)=>{
      console.log(error);
    })
  };

  render() {
    //视频数据
    let item = this.state.video;
    //评论数据
    let commentData = this.state.commentData;
    //进度条
    const flexCompleted = this.getCurrentTimePercentage() * 100;
    const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;
    return (
      <View style={styles.container}>
        <Text style={styles.videoTitle}>{item.video_name}</Text>
        <View style={styles.videoBox}>
          <Video source={{uri: item.video_path}}  // Can be a URL or a local file.
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
             style={styles.videoBox} />

           {/* 加载菊花图 */}
           <ActivityIndicator
             style={styles.loading}
             size="large"
             color="#0000ff"
             animating={this.state.animating}
            />

            {/* 视频出错 */}
            {
              this.state.videoError ?
              <Text style={styles.failText}>很抱歉，视频君在来的路上挂了，请试着重新加载！</Text>
              : null
            }

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

        {/* 视频详情信息 */}
        <View style={styles.infoBox}>
           <Image style={styles.avatar} source={{uri:item.avatar}} />
           <View style={styles.descBox}>
             <Text style={styles.nickname} >{item.username}</Text>
             <Text style={styles.videoDesc}>{item.video_desc}</Text>
           </View>
           <View style={styles.descBox}>
             <Text style={styles.playVolume}>播放量：{item.play_volume}</Text>
           </View>
         </View>

          {/* 视频详情描述 */}
          <ScrollView
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator = {false}
            style = {styles.scrollBox} >
            <FlatList
              data={this.state.commentData}
              //添加头部布局:评论区
              ListHeaderComponent={this._createListHeader}
              //列表布局
              renderItem={this._renderRow}
              //分割线
              ItemSeparatorComponent={this._separator}
              keyExtractor={item => item.id.toString()}
            />

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
                      <View style={styles.addCommentBox}>
                        <TextInput
                          placeholder="这是一条有温度的评论！"
                          style={styles.addComment}
                          onChangeText={(text) => this.setState({text})}
                          onBlur={this._onBlur}
                          defaultValue={this.state.text}
                        />
                      </View>
                    </View>
                    <Button
                      onPress={this._onSubmit}
                      title="提交评论"
                      size='md'
                      type='primary'
                      style={styles.submitBtn}
                    />
                </View>
              </Modal>
          </ScrollView>
      </View>
    );
  }

  /**
   * 分割线
   */
  _separator() {
      return <View style={{height: 1, backgroundColor: '#999999'}}/>;
  }

  _createListHeader(){
    return(
      <View style={styles.listHeader}>
          <View style={styles.addCommentBox}>
            <TextInput
              placeholder="这是一条有温度的评论！"
              style={styles.addComment}
              onChangeText={(text) => this.setState({text})}
              onBlur={this._onBlur}
              onFocus={this._onFocus}
              // defaultValue={this.state.text}
            />
          </View>
          <View style={styles.commentArea}>
            <Text style={styles.title}>精彩评论：</Text>
          </View>
      </View>
    )
  }

  _onSubmit = () => {
    let video = this.state.video;
    let user = this.state.user;
    let text = this.state.text;
    let isPost = this.state.isPost;
    let url = config.domain.http + config.domain.video_add_comment;
    let that = this;
    if(!text){
      return Toast.info("评论不能为空！");
    }
    if(isPost){
      return Toast.info("评论正在提交！");
    }
    this.setState({
      isPost:true
    }, function(){
      let body = {
        content:text,
        video_id:video.id,
        user_id:video.uid
      }
      request.post(url, body, user.token)
      .then(data => {
        console.log('data',data);
        if(data.code === 1){
          //成功了，重新加载评论吧，这里也可以拼接，但是实时性不高
          that._fetchData();
          //关闭弹窗
          that.setState({
            modalVisible:false,
            isPost:false,
            text:'',
          });
          Toast.smile(data.msg);
        }else{
          that.setState({
            modalVisible:false,
            isPost:false,
          })
          Toast.sad('评论失败！');
        }
      })
      .catch((err)=>{
        console.log(err);
        that.setState({
          modalVisible:false,
          isPost:false
        })
        Toast.sad(err);
      })
    })
  }

  _onFocus = () => {
    this.setModalVisible(true)
  }

  _onBlur = () => {
    console.log('onBlur');
  }

  _closeModal = () => {
    this.setModalVisible(false)
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  _renderRow({ item }) {
    let comment = item;
    return(
      <View style={styles.commentBox} key={item.id}>
        <Image style={styles.commentAvatar} source={{uri:comment.avatar}} />
        <View style={styles.comment}>
          <Text style={styles.commentNickname} >{comment.username}</Text>
          <Text style={styles.commentContent}>{comment.content}</Text>
        </View>
      </View>
    )
  }

  onLoad = (data) => {
      this.setState({duration: data.duration});
  };

  onProgress = (data) => {
      this.setState({
        currentTime: data.currentTime,
        animating:false,
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

}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
  },
  videoTitle: {
    fontSize: 18,
    paddingTop:5,
    color: '#333',
  },
  videoBox:{
    width: width,
    height: 300,
    backgroundColor:'#000'
  },
  scrollBox:{
    width: width,
    marginTop:30,
  },
  progress: {
      flex: 1,
      flexDirection: 'row',
      borderRadius: 3,
      overflow: 'hidden',
  },
  innerProgressCompleted: {
      height: 20,
      backgroundColor: '#cccccc',
  },
  innerProgressRemaining: {
      height: 20,
      backgroundColor: '#2C2C2C',
  },
  loading:{
    position:'absolute',
    top:140,
    left: width/2 -30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    alignSelf:'center',
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
    top:120,
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
  playIcon:{
    position:'absolute',
    top:120,
    left: width/2 -30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#ed7b66'
  },
  failText:{
    position:'absolute',
    top:200,
    left: 0,
    width:width,
    textAlign:'center',
    color:'#fff',
    backgroundColor:'transparent'
  },
  infoBox:{
    width:width,
    flexDirection:'row',
    justifyContent:'center',
    marginTop:10,
  },
  avatar:{
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius:30
  },
  descBox:{
    flex:1
  },
  nickname:{
    fontSize:18
  },
  videoDesc:{
    width:width,
    marginTop:8,
    fontSize:16,
    color:'#666'
  },
  playVolume:{
    marginTop:5,
    marginRight:5,
    textAlign:'right',
    fontSize:12,
    color:'#777'
  },
  commentBox:{
    width:width,
    flexDirection:'row',
    justifyContent:'center',
    marginTop:20,
  },
  commentAvatar:{
    width:40,
    height:40,
    marginRight:10,
    marginLeft:10,
    borderRadius:20
  },
  comment:{
    flex:1
  },
  commentNickname:{
    fontSize:12
  },
  commentContent:{
    width:width,
    marginTop:8,
    fontSize:16,
    color:'#666'
  },
  addCommentBox:{
    padding:8,
    width:width
  },
  addComment:{
    paddingLeft:2,
    color:'#333',
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:4,
    fontSize:14,
    height:80,
  },
  listHeader:{
    width:width
  },
  commentArea:{
    width:width,
    marginTop:10,
    paddingBottom:6,
    paddingLeft:10,
    paddingRight:10,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
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
  submitBtn:{
    borderWidth:1,
    borderColor:'#eee',
    borderRadius:4,
    color:'#ee753c',
    marginTop:20,
    marginLeft:20,
    marginRight:20,
  }
});
export default withNavigation(Detail);
