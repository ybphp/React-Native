import React, { Component } from 'React';
import {
    FlatList,
    TouchableOpacity,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    Modal,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import CountDown from 'react-native-countdown-component';
import Icon from 'react-native-vector-icons/Ionicons';
import {NavigationPage, ListRow, Input, Button, Checkbox, Label, Toast, Theme} from 'teaset';

const config = require('../common/config');
const request = require('../common/request');


//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

export default class Login extends Component{
  constructor(props) {
      super(props);
      this.state = {
          phoneNumber:'',
          password:'',
          isPost:false
      }
  }

  componentDidMount() {
      //读取本地存储用户信息
      this._retrieveData();
  };

  //读取本地存储用户信息
  _retrieveData = async () => {
    let that = this;
    try {
      let user = await AsyncStorage.getItem('user');
      //本地已经缓存user信息
      if (user != null) {
        user = JSON.parse(user);
        //向服务器校验token是否失效
        let url   =   config.domain.http + config.domain.checkToken;
        let body  =   {token: user.token};
        request.get(url, body)
        .then(data => {
          if(data.code === 1){
            that.setState({
              logined:true,
            });
            Toast.smile("登录成功");
            this.props.navigation.navigate('Index');
          }else{
            //清除用户缓存，已经过期了
            that._removeValue('user');
            Toast.info("登录失效");
          }
        })
        .catch(error => {
          console.error(error);
        });
        //有效期1天吧
        //注意js时间戳按毫秒计算，php按秒计算
        // const currentTimestamp = Date.now();
        // if(currentTimestamp/1000 > user.expiretime){
        //   //清除用户缓存，已经过期了
        //   that._removeValue('user');
        //   that.setState({
        //     visible:true,
        //     msg:'登录失效！'
        //   });
        //   setTimeout(() => this.setState({
        //       visible: false,
        //       msg:''
        //   }), 4000); // hide toast after 5s
        //   return true;
        // }
      }
     } catch (error) {
       // Error retrieving data
       console.log('usererror:', error);
     }
  }

  //保存数据
  _storeData = async (data) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(data));
      console.log('Success saving data', JSON.stringify(data));
    } catch (error) {
      // Error saving data
      console.log('Error saving data', $data);
    }
  }

  //删除数据
  _removeValue = async (key) => {
    try {
      await AsyncStorage.removeItem(key)
      console.log('remove.key',key)
    } catch(e) {
      // remove error
    }
  }

  render() {
      return (
          <SafeAreaView style={styles.container}>
            <View style={styles.avatarBox}>
                <ImageBackground source={require('../../img/qiyue_logo.png')} style={styles.avatar}>
                </ImageBackground>
            </View>

            <View style={styles.signBox}>
              <Text style={styles.title}>欢迎登录</Text>
            <ListRow title='手机号' detail={
                <Input
                  size='md'
                  value={this.state.phoneNumber}
                  placeholder="请输入手机号"
                  dataDetectorTypes="phoneNumber"
                  keyboardType="numeric"
                  autoCaptialize={"none"}
                  autoCorrect={false}
                  style={styles.signInputField}
                  onChangeText={(phoneNumber)=>this.setState({phoneNumber})}
                  />
              } />
              <ListRow title='密    码' detail={
                <Input
                  size='md'
                  placeholder="请输入密码"
                  autoCaptialize={"none"}
                  autoCorrect={false}
                  keyboradType={'number-pad'}
                  secureTextEntry={true}
                  style={styles.signInputField}
                  onChangeText={(password)=>this.setState({password})}
                  />
              }/>

            <Button title='登录' size='md' type='primary' style={styles.signBtn} onPress = {this._onSubmit} />
            <ListRow detail={
                <Checkbox
                  title='记住密码'
                  size='md'
                  titleStyle={{color: '#8a6d3b', paddingLeft: 4}} checked={this.state.checkedMD}
                  checked={this.state.checkedMD}
                  onChange={value => this.setState({checkedMD: value})}
                  />
              } />
              <View style={styles.textBox}>
                <Button title='忘记密码' type='link' style={styles.resetPwdText} onPress={this._resetPwd} />
                <Button title='注册' type='link'  style={styles.registerText} onPress={this._onRegister}  />
              </View>
            </View>
          </SafeAreaView>
      );
  }

  //提示框
  showCustom() {
    if (Login.customKey) return;
    Login.customKey = Toast.show({
      text: '正在注册',
      icon: <ActivityIndicator size='large' color={Theme.toastIconTintColor} />,
      position: 'top',
      duration: 2000,
    });
  }

  //注册页面
  _onRegister = () => {
    this.props.navigation.navigate('Register');
  }

  //忘记密码页面
  _resetPwd = () => {
    this.props.navigation.navigate('ResetPwd');
  }

  //登录方法
  _onSubmit = () => {
    let phoneNumber = this.state.phoneNumber;
    let password = this.state.password;
    let that = this;
    let isPost = this.state.isPost;
    let url = config.domain.http + config.domain.login;
    const { navigate } = this.props.navigation;
    if(!phoneNumber){
      return Toast.fail('手机号不能为空！');
    }

    if(!(/^1[3456789]\d{9}$/.test(phoneNumber))){
      return Toast.fail('手机号码有误！');
    }

    if(isPost){
      return this.showCustom();
    }

    this.setState({
      isPost:true
    }, function(){
      let body = {
        mobile:phoneNumber,
        password:password
      }
      request.post(url, body)
      .then(data => {
        if(data.code === 1){
          //本地存储用户信息
          that._storeData(data.data.userinfo);
          Toast.smile(data.msg);
          navigate('Index');
        }else{
          that.setState({
            isPost:false,
          });
          Toast.sad(data.msg);
        }
      })
      .catch((err)=>{
        console.log(err);
        that.setState({
          isPost:false
        });
        Toast.sad('网络异常！');
      })
    })
  }

}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding:10,
      backgroundColor: '#f9f9f9',
  },
  signBox:{
    marginTop:20,
  },
  avatarBox:{
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  avatar:{
    width:width,
    height: width*0.56,
    alignSelf:'auto'
  },
  title:{
    marginBottom:20,
    color:"#333",
    fontSize:20,
    textAlign:"center",
  },
  signInputField:{
    width:width/1.5 + 20,
  },
  signBtn:{
    marginLeft:10,
    marginRight:10
  },
  textBox:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:20
  },
  resetPwdText:{
    textAlign:'left',
    marginLeft:10,
    fontSize:12,
  },
  registerText:{
    textAlign:'right',
    marginRight:10,
    fontSize:12
  }
});
