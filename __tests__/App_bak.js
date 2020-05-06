//keytool -genkey -v -keystore my-release-key.keystore -alias my-key-ybphp -keyalg RSA -keysize 2048 -validity 10000
// keytool -importkeystore -srckeystore my-release-key.keystore -destkeystore my-release-key.keystore -deststoretype pkcs12

import React, { Component } from "react";
import { Image, FlatList, StyleSheet, Text, View } from "react-native";
import TabNavigator from 'react-native-tab-navigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
//首页
import Index from './app/creation/index';
//编辑
import Edit from './app/edit/edit';
//账户
import Account from './app/account/account';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab:'home'
    };
  }

  render() {
    return this.renderTabBar();
  }

  renderTabBar(){
    return(
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={{fontSize:25}}>TabNavigator组件</Text>
          </View>

          <TabNavigator>
            <TabNavigator.Item title='首页'
                               badgeText="new"
                               selected={this.state.selectedTab==='home'}
                               renderIcon={()=><Ionicons  name={'home'} size={26} color={'#ccc'} />}
                               renderSelectedIcon={()=><Ionicons  name={'home'} size={26} color={'#ccc'} />}
                               onPress={()=>{this.setState({selectedTab:'home'})}}
            >
              <View style={[styles.pageView,{backgroundColor:'#ffdd57'}]}>
              <Index />
              </View>
            </TabNavigator.Item>
            <TabNavigator.Item title='分类'
                               selected={this.state.selectedTab==='category'}
                               renderIcon={()=><Image style={styles.iconImg} source={require("./img/avatar.png")} />}
                               renderSelectedIcon={()=><Image style={styles.iconActive} source={require("./img/avatar.png")} />}
                               onPress={()=>{this.setState({selectedTab:'category'})}}
            >
            <Edit />
            </TabNavigator.Item>
            <TabNavigator.Item title='发现'
                               selected={this.state.selectedTab==='find'}
                               renderIcon={()=><Ionicons  name={'cart'} size={26} />}
                               renderSelectedIcon={()=><Ionicons  name={'cart'} size={26} />}
                               onPress={()=>{this.setState({selectedTab:'find'})}}
            >
              <View style={[styles.pageView,{backgroundColor:'#9aff5a'}]}>
                <Text style={{fontSize:50}}>发现更多</Text>
              </View>
            </TabNavigator.Item>
            <TabNavigator.Item title='我的'
                               badgeText="6"
                               selected={this.state.selectedTab==='mine'}
                               renderIcon={()=><Image style={styles.iconImg} source={{uri:"mipmap/mine"}} />}
                               onPress={()=>{this.setState({selectedTab:'mine'})}}
            >
            <Account />
            </TabNavigator.Item>
          </TabNavigator>
        </View>
      )
  }
}



var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },

  header:{
    height:50,
    backgroundColor:'#bcfffd',
    justifyContent:'center',
    alignItems:'center'
  },

  pageView:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  iconImg:{
    width:25,
    height:15
  },

  iconActive:{
    width:35,
    height:15
  },

  rightContainer:{
    flex: 1
  },

  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center"
  },

  year: {
    textAlign: "center"
  },

  thumbnail: {
    width: 53,
    height: 81
  },

  list: {
    paddingTop: 20,
    backgroundColor: "#F5FCFF"
  }

});
