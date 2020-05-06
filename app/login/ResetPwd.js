import React, { Component } from 'React';
import {
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TextInput,
    ScrollView,
    View
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import CountDown from 'react-native-countdown-component';
import Icon from 'react-native-vector-icons/Ionicons';
import {ListRow, Input, Button, Checkbox, Label, Toast, Theme} from 'teaset';

var config = require('../common/config');
var request = require('../common/request');


//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

export default class ResetPwd extends Component{
  constructor(props) {
      super(props);
      //状态
      this.state = {
          phoneNumber:'',
          password:'',
          rePassword:'',
          code:'',
          sendCode:false,     //发送验证码
          countingDone:false,//验证码发送结束
          isPost:false,
      }
  }

  componentDidMount() {
  };

  render() {
      return (
          <SafeAreaView style={styles.container}>
            <ScrollView style={{flex: 1}}>
              <ListRow title='手  机  号' detail={
                <Input
                  size='md'
                  value={this.state.phoneNumber}
                  placeholder="请输入验证的手机号"
                  dataDetectorTypes="phoneNumber"
                  keyboardType="numeric"
                  autoCaptialize={"none"}
                  autoCorrect={false}
                  style={styles.signInputField}
                  onChangeText={(phoneNumber)=>this.setState({phoneNumber})}
                  />
              } />

            <ListRow title='新  密  码' detail={
                <Input
                  size='md'
                  value={this.state.password}
                  placeholder="密码长度不能小于6位"
                  autoCaptialize={"none"}
                  autoCorrect={false}
                  keyboradType={'number-pad'}
                  secureTextEntry={true}
                  style={styles.signInputField}
                  onChangeText={(password)=>this.setState({password})}
                  />
              } />

            <ListRow title='确认密码' detail={
                <Input
                  size='md'
                  value={this.state.rePassword}
                  placeholder="请再输入一次密码"
                  autoCaptialize={"none"}
                  autoCorrect={false}
                  keyboradType={'number-pad'}
                  secureTextEntry={true}
                  style={styles.signInputField}
                  onChangeText={(rePassword)=>this.setState({rePassword})}
                />
              } />

              <ListRow title='验  证  码' detail={
                <Button type="link">
                  <Input
                    size='md'
                    value={this.state.code}
                    placeholder="请输入验证码"
                    autoCaptialize={"none"}
                    autoCorrect={false}
                    keyBoradType={'number-pad'}
                    style={styles.codeInputField}
                    onChangeText={(code)=>this.setState({code})}
                    />
                    {
                      !this.state.countingDone ?
                      <Button title='发送验证码' style={styles.codeBtn} type='secondary' onPress={this._sendCode} />
                      :
                        <CountDown
                          until={120}
                          size={15}
                          style = {{width:100, height:40}}
                          onPress={() => Toast.message('验证码已发送')}
                          onFinish={this._countingDone}
                          digitStyle={{backgroundColor: '#4e72b8'}}
                          digitTxtStyle={{color: '#f58220',fontSize:20}}
                          timeToShow={['S']}
                          timeLabels={{ s: '倒计时'}}
                          timeLabelStyle={{color: 'red', fontWeight: 'bold', fontSize:10}}
                        />
                    }
                </Button>
              } topSeparator='full' bottomSeparator='full' />

            <Button title='修改密码' size='md' type='primary' style={styles.signBtn} onPress = {this._onSubmit} />
            </ScrollView>
          </SafeAreaView>
      );
  }

  //提示框
  showCustom() {
    if (ResetPwd.customKey) return;
    ResetPwd.customKey = Toast.show({
      text: '正在重置密码',
      icon: <ActivityIndicator size='large' color={Theme.toastIconTintColor} />,
      position: 'top',
      duration: 2000,
    });
  }

  _onSubmit = () => {
    let phoneNumber = this.state.phoneNumber;
    let password = this.state.password;
    let rePassword = this.state.rePassword;
    let captcha = this.state.code;
    let that = this;
    let isPost = this.state.isPost;
    let url = config.domain.http + config.domain.resetPwd;
    const { navigate } = this.props.navigation;
    if(!phoneNumber){
      return Toast.fail('手机号不能为空！');
    }

    if(!(/^1[3456789]\d{9}$/.test(phoneNumber))){
      return Toast.fail('手机号码有误！');
    }

    if(password.length < 6){
      return Toast.info('密码长度不能小于6位！');
    }

    if(password != rePassword){
      return Toast.fail('两次密码输入不一致！');
    }
    //正在注册
    if(isPost){
      return this.showCustom();
    }

    this.setState({
      isPost:true
    }, function(){
      let body = {
        mobile:phoneNumber,
        password:password,
        captcha:captcha
      }
      request.post(url, body)
      .then(function(data){
        if(data.code === 1){
          that.setState({
            isPost:false,
          });
          Toast.smile(data.msg);
          navigate('Login');
        }else{
          that.setState({
            isPost:false,
          })
          Toast.sad(data.msg)
        }
      })
      .catch((err)=>{
        that.setState({
          isPost:false
        })
        Toast.sad('网络异常！');
      })
    })
  }

  //发送验证码
  _sendCode=()=>{
    let phoneNumber = this.state.phoneNumber;
    let url = config.domain.http + config.domain.sendCode;
    if(!phoneNumber){
      return Toast.fail('手机号不能为空！');
    }

    if(!(/^1[3456789]\d{9}$/.test(phoneNumber))){
      return Toast.fail('手机号码有误！');
    }

    let that = this;
    that.setState({
      isPost:true
    }, function(){
      let body = {
        mobile:phoneNumber,
        event:'resetPwd'
      }
      request.post(url, body)
      .then(function(data){
        if(data.code === 1){
          that.setState({
            sendCode:true,
            countingDone:true,
            isPost:false,
          });
          Toast.smile(data.msg);
        }else{
          that.setState({
            isPost:false,
          });
          Toast.smile(data.msg);
        }
      })
      .catch((err)=>{
        console.log(err);
        that.setState({
          isPost:false
        })
        Toast.sad('网络异常！');
      })
    })
  }

  _countingDone = () => {
    this.setState({
      countingDone:true,
      sendCode:false
    })
  }

}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding:10,
      backgroundColor: '#f9f9f9',
  },

  signInputField:{
    width:width/1.5 + 10,
  },
  codeInputField:{
    width:width/3 ,
  },
  signBtn:{
    marginLeft:10,
    marginRight:10
  },
  codeBtn:{
    marginLeft:10,
  }
});
