import React, { Component } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  View
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { SafeAreaView } from 'react-navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import DatePicker from 'react-native-datepicker';
import {
  Theme,
  ListRow,
  Input,
  Label,
  SegmentedBar,
  Toast,
  Popover,
  TabView,
  AlbumView,
  SegmentedView,
  Overlay,
  Button
} from 'teaset';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

// 公共组件
import TabViewBtn from '../common/TabViewBtn';
var config = require('../common/config');
var request = require('../common/request');

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

export default class Account extends Component {
  constructor(props) {
      super(props);
      //状态
      this.state = {
          avatarSource:'',
          user:'',
          username:'',
          nickname:'',
          mobile:'',
          birthday:'',
          gender:1,
          genderTypes:[
            {label: '男', value: 1 },
            {label: '女', value: 2 }
          ],
          bio:'',
          modalVisible: false,
          isPost:false,
          qiniuToken:'',
          qiniuUrl:'',
          qiniuCdn:'',
          myVideoData:null,
          myFans:null
      };
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
        // We have data!!
        user = JSON.parse(user);
        console.log('user:',user);
        that.setState({
          user:user,
          avatarSource:user.avatar,
          username:user.username,
          mobile:user.mobile,
          gender:user.gender,
          birthday:user.birthday,
          bio:user.bio,
          nickname:user.nickname,
          modalVisible: false,
          visible:false,      //提示
          msg:'',
          isPost:false,
        });
        //获取七牛Token
        that._qiniuToken();
        //获取我的视频
        this._myVideoData();
        //获取我的粉丝
        this._myFans();
      }else{
        // 登出
        this._onLogout();
        Toast.info('登录已失效！');
      }
     } catch (error) {
       // Error retrieving data
       console.log('usererror:', error);
     }
  }

  /**
   * 我的视频
   */
  _myVideoData(){
    const that = this;
    let user = this.state.user;
    let url = config.domain.http + config.domain.my_video;
    let body = {
      token:user.token
    }
    request.get(url, body)
    .then(function(data){
      console.log('data',data);
      if(data.code === 1){
        that.setState({
          myVideoData: data.data,
        });
      }else{
        Toast.sad('请求我的视频失败！')
      }
    })
    .catch((error)=>{
      console.log(error);
    })
  };
  _myFans(){
    const that = this;
    let user = this.state.user;
    let url = config.domain.http + config.domain.my_fans;
    let body = {
      token:user.token
    }
    request.get(url, body)
    .then(function(data){
      console.log('fansdata',data);
      if(data.code === 1){
        that.setState({
          myFans: data.data,
        });
      }else{
        Toast.sad('请求我的粉丝失败！')
      }
    })
    .catch((error)=>{
      console.log(error);
    })
  };

  render() {
    let user = this.state.user;
    return (
      <SafeAreaView style={styles.container}>
        {this.state.avatarSource ?
          <TouchableOpacity style={styles.avatarContainer} onPress={this._selectAvatar} >
            <ImageBackground source={{ uri: this.state.avatarSource }} style={styles.avatarContainer}>
              <Image
                style={styles.avatar}
                source={{uri: this.state.avatarSource}}
              />
            </ImageBackground>
          </TouchableOpacity>
          :
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarTip} >添加头像</Text>
            <TouchableOpacity style={styles.avatarBox}>
              <Icon
                name="ios-add"
                size={28}
                style={styles.addIcon}
                onPress={this._selectAvatar}
              />
            </TouchableOpacity>
          </View>
        }
        <SegmentedView style={{flex: 1}} type='projector'>
          <SegmentedView.Sheet title=<TabViewBtn name='我的信息' /> >
            <View style={{flex: 1, marginTop:20}}>
              <ListRow title='姓名'   detail={this.state.username} titleStyle={styles.listRowTitle} icon={<Image style={styles.iconImg} source={require('../../icons/name_96px.png')} />} onPress={() => this.setModalVisible(true)} />
              <ListRow title='手机号' detail={this.state.mobile} titleStyle={styles.listRowTitle} icon={<Image style={styles.iconImg} source={require('../../icons/phone_call_96px.png')} />} onPress={() => this.setModalVisible(true)} />
              <ListRow title='性别'  detail={this.state.gender== '1' ? '男' : '女'} titleStyle={styles.listRowTitle} icon={<Image style={styles.iconImg} source={require('../../icons/gender.png')} />} onPress={() => this.setModalVisible(true)} />
              <ListRow title='年龄'  detail={this.state.birthday} titleStyle={styles.listRowTitle} icon={<Image style={styles.iconImg} source={require('../../icons/i_love_icons_96px.png')} />} onPress={() => this.setModalVisible(true)} />
              <ListRow title='格言'  detail={this.state.bio} titleStyle={styles.listRowTitle} icon={<Image style={styles.iconImg} source={require('../../icons/pin_96px.png')} />} onPress={() => this.setModalVisible(true)} />
              <View style={styles.btnBox}>
                <Button type='secondary' size='md' title='退出登录' onPress = {this._onLogout} />
              </View>
            </View>
          </SegmentedView.Sheet>

          <SegmentedView.Sheet title=<TabViewBtn name='我的视频' /> badge={1} >
            <ScrollView style={{flex: 1}}>
              <View style={{padding: 20, flexDirection:'row', flexWrap:'wrap', alignItems:'flex-start'}}>
                {this.state.myVideoData
                  ?
                  this.state.myVideoData.map((item, index) => (
                  <View style={{width: 100, height: 100, padding: 10}} key={index}>
                    <TouchableOpacity style={{flex: 1}} ref={'it' + index} onPress={() => this.props.navigation.navigate('Detail',{item, user})}>
                      <Image style={{width: null, height: null, flex: 1}} source={{uri:item.image_path}} resizeMode='cover' />
                    </TouchableOpacity>
                  </View>
                ))
                :
                <Text>去发布一个视频吧</Text>
              }
              </View>
            </ScrollView>
          </SegmentedView.Sheet>

          <SegmentedView.Sheet title=<TabViewBtn name='我的粉丝' /> >
            <ScrollView style={{flex: 1}}>

              <View style={{padding: 10, flexDirection:'row', flexWrap:'wrap', alignItems:'flex-start'}}>
                {this.state.myFans
                  ?
                    this.state.myFans.map((item, index) => (
                      <View style={{padding: 10}} key={index}>
                        <Popover style={styles.popoverStyle}>
                          <Label style={{color: '#000'}} text={item.username} />
                        </Popover>
                      </View>
                  ))
                  :
                    <Text>还没有粉丝哦！</Text>
                }
              </View>

            </ScrollView>
          </SegmentedView.Sheet>
        </SegmentedView>

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
                <ListRow title='姓名' titleStyle={styles.ListRowTitle} detail={
                  <Input
                    size='md'
                    value={this.state.username}
                    placeholder="输入姓名，2~4个字符"
                    style={styles.signInputField}
                    onChangeText={(username) => this.setState({username})}
                    />
                 } />

                 <ListRow title='昵称' titleStyle={styles.ListRowTitle} detail={
                   <Input
                     size='md'
                     value={this.state.nickname}
                     placeholder="昵称"
                     style={styles.signInputField}
                     onChangeText={(nickname) => this.setState({nickname})}
                     />
                  } />

                  <ListRow title='性别' titleStyle={styles.ListRowTitle} detail={
                    <RadioForm
                      radio_props={this.state.genderTypes}
                      initial={0}
                      formHorizontal={true}
                      labelHorizontal={true}
                      buttonColor={'#2196f3'}
                      animation={true}
                      initial={0}
                      style={styles.signInputField}
                      onPress={(gender) => {this.setState({gender:gender})}}
                    />
                   } />

                   <ListRow title='年龄' titleStyle={styles.ListRowTitle} detail={
                     <DatePicker
                       style={styles.signInputField}
                       date={this.state.birthday}
                       mode="date"
                       placeholder="设置年龄"
                       format="YYYY-MM-DD"
                       confirmBtnText="Confirm"
                       cancelBtnText="Cancel"
                       customStyles={{
                         dateIcon: {
                           position: 'absolute',
                           left: 0,
                           top: 4,
                           marginLeft: 0
                         },
                         dateInput: {
                           marginLeft: 36
                         }
                         // ... You can check the source to find the other keys.
                       }}
                       onDateChange={(birthday) => {this.setState({birthday:birthday})}}
                     />
                    } />

                    <ListRow title='格言' titleStyle={styles.ListRowTitle} detail={
                      <Input
                        size='md'
                        value={this.state.bio}
                        placeholder="给自己来个个性签名呗"
                        style={styles.signInputField}
                        onChangeText={(bio) => this.setState({bio})}
                        />
                     } />

                     <Button title='保存' size='md' type='primary' style={styles.submitBtn} onPress={this._postData} />
              </View>
          </View>
        </Modal>
        </SafeAreaView>
    );
  }

  _addIcon = () => {
    console.log("addIcon");
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  _closeModal = () => {
    this.setModalVisible(false)
  }

  //选择头像
  _selectAvatar = () =>{
    let that = this;
    ImagePicker.openPicker({
      width: 400,
      height: 200,
      cropping: true
    }).then(image => {
      that.setState({
        avatarSource:image.path
      })
      //上传图片到七牛
      that._qiniuUpload(image);
    });
  }

  //获取七牛Token
  _qiniuToken = () => {
    //获取七牛Token
    let url = config.domain.http + config.domain.qiniuToken;
    let that=this;
    let params = "token="+that.state.user.token;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded',
      },
      body: params
    })
    .then(response => response.json())
    .then(data => {
      if(data.code === 1){
        that.setState({
          qiniuToken:data.data.multipart.token,
          qiniuUrl:data.data.uploadurl,
          qiniuCdn:data.data.cdnurl
        })
      }else{
        Toast.sad("获取七牛Token失败，请重新登录！");
        // 登出
        this._onLogout();
      }
    }).catch(error => {
      console.error(error);
    });
  }

  //七牛上传头像
  _qiniuUpload =(image)=>{
    //获取七牛Token
    let that=this;
    let qiniuToken = that.state.qiniuToken;
    let qiniuUrl = that.state.qiniuUrl;
    //构建表单
    let formData = new FormData();
    let _time = parseInt(new Date().getTime());
    let suiji = Math.floor(Math.random() * 1000)
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let formatedMonth = month < 10 ? '0' + month : month;
    let day = new Date().getDate();
    let path = 'uploads/'+year + formatedMonth + day + '/' + _time + suiji + image.path.substr(image.path.lastIndexOf("."));
    formData.append("file", { uri:image.path, type:'application/octet-stream', name: path });
    formData.append("key", path);
    formData.append("token", qiniuToken);
    fetch(qiniuUrl, {
        method: 'POST',
        headers: {},
        body: formData,
        contentType: false,
        processData: false,
    }).then((response) => response.json())
      .then((responseData) => {
        console.log('responseData',responseData);
        let params = "avatar="+that.state.qiniuCdn+responseData.key;
        that._submitProfile(params);
        that.setState({
          avatarSource:that.state.qiniuCdn+responseData.key
        })
      })
      .catch((error) => {
          console.log('error', error);
      });
  }

  //登出
  _onLogout = async() => {
    //删除用户缓存数据
    try {
      await AsyncStorage.removeItem('user');
      this.props.navigation.navigate('Login');
    } catch(e) {
      console.log('err:',e);
    }
  }

  _postData = () =>{
    let url = config.domain.http + config.domain.profile;
    let params = "nickname="+this.state.nickname+"&bio="+this.state.bio+"&gender="+this.state.gender+"&birthday="+this.state.birthday+"&username="+this.state.username;
    this._submitProfile(params, '修改个人信息成功！');
  }

  //提交修改的个人信息
  _submitProfile = (data) =>{
    let url = config.domain.http + config.domain.profile;
    let that=this;
    let params = data + "&token="+this.state.user.token;
    console.log('url:', url);
    console.log('params:',params);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded',
      },
      body: params
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if(data.code === 1){
        //关闭弹窗
        that.setState({
          modalVisible:false,
          isPost:false
        });
        //更新本地存储用户信息
        that._storeData(data.data.userinfo);
        Toast.smile("修改成功！");
      }else{
        Toast.sad("修改失败,请重试！");
      }
    }).catch(error => {
      console.error(error);
    });
  }

  //保存数据
  _storeData = async (data) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      // Error saving data
      console.log('Error saving data', $data);
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listRowTitle:{
    fontSize: 15,
    color: '#31708f',
    paddingLeft:10
  },
  modalContainer:{
    flex:1,
    paddingTop:40,
    backgroundColor:'#fff'
  },
  signInputField:{
    width: width/1.5,
    borderColor: '#8a6d3b',
    color: '#8a6d3b',
    textAlign: 'left',
    marginRight:40
  },
  iconImg:{
    width:20,
    height:20
  },
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:"#eee",
  },
  avatarBox:{
    marginTop:10,
    alignItems:'center',
    justifyContent:'center'
  },
  avatar:{
    position: 'absolute',
    marginBottom:15,
    width:width*0.2,
    height:width*0.2,
    resizeMode:'cover',
    borderWidth:1,
    borderRadius:width*0.2,
  },
  addIcon:{
    color:"#ee735c",
    fontSize:50,
  },

  avatarTip:{
    paddingTop:10,
    color:'#ee735c',
    fontSize:15
  },

  listHeader:{
    width:width,
    marginLeft:10,
    marginRight:10,
    marginBottom:20
  },

  closeIcon:{
    alignSelf:'center',
    fontSize:40,
    color:'#ccc'
  },
  btnBox:{
    marginLeft:20,
    marginRight:20,
    marginTop:20,
    marginBottom:5,
  },
  submitBtn:{
    borderWidth:1,
    borderColor:'#eee',
    borderRadius:4,
    color:'#ee753c',
    marginTop:20,
    marginLeft:20,
    marginRight:20,
  },
  popoverStyle: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowStyle: {
    shadowColor: '#777',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});

// AppRegistry.registerComponent('Account', () => Account);
