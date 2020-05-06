//keytool -genkey -v -keystore my-release-key.keystore -alias my-key-ybphp -keyalg RSA -keysize 2048 -validity 10000
// keytool -importkeystore -srckeystore my-release-key.keystore -destkeystore my-release-key.keystore -deststoretype pkcs12

import React, { Component } from "react";
import { Image, FlatList, StyleSheet, Text, Button, View } from "react-native";
//Tab组件
import {
  createBottomTabNavigator,
  createAppContainer,
  createDrawerNavigator,
  createStackNavigator,
  NavigationScreenProp,
  NavigationState,
  SafeAreaView,
} from 'react-navigation';

import Ionicons from 'react-native-vector-icons/Ionicons';

import IconWithBadge from './app/common/IconWithBadge';

// 公共组件
import TitleHead from './app/common/TitleHead';

//首页
import Index from './app/creation/Index';
import Detail from './app/creation/Detail';

//视频
import Video from './app/video/Video';
import ImagePickerDemo from './app/video/Image_picker';

//账户
import Account from './app/account/Account';

//登录
import Login from './app/login/Login';
import Register from './app/login/Register';
import ResetPwd from './app/login/ResetPwd';
//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

const HomeIconWithBadge = props => {
  // You should pass down the badgeCount in some other ways like context, redux, mobx or event emitters.
  return <IconWithBadge {...props} />;
};

const IndexStack = createStackNavigator({
  Index: { screen: Index},
  Detail: { screen: Detail },
});

const VideoStack = createStackNavigator({
  Video: {
    screen: Video,
    navigationOptions: () => ({
      headerTitle: <TitleHead name='你的视频从这里开始' />,
      headerStyle: {
        backgroundColor: '#ef4136',
      },
      headerBackTitle: '返回录制'
    })
  },
  ImagePickerDemo: { screen: ImagePickerDemo },
});

const AccountStack = createStackNavigator({
  Account: {
    screen: Account,
    navigationOptions: () => ({
      headerTitle: <TitleHead name='个人中心' />,
      headerStyle: {
        backgroundColor: '#ef4136',
      },
      headerBackTitle: '返回账户'
    })
  },
  Detail: { screen: Detail }
});

const LoginStack = createStackNavigator({
  Login: { screen: Login},
  Register: { screen: Register,
    navigationOptions: () => ({
      headerTitle: <TitleHead name='欢迎注册' styleType='loginHeadTitle' />,
    })
  },
  ResetPwd: { screen: ResetPwd,
    navigationOptions: () => ({
      headerTitle: <TitleHead name='忘记密码' styleType='loginHeadTitle' />,
    })
  }
});

LoginStack.navigationOptions = ({ navigation }) => {
  //隐藏底部tab栏
  let tabBarVisible = false;
  // if (navigation.state.index > 0) {
  //   tabBarVisible = false;
  // }
  return {
    tabBarVisible,
  };
};


const getTabBarIcon = (navigation, focused, tintColor) => {
  const { routeName } = navigation.state;
  let IconComponent = Ionicons;
  let iconName;
  if (routeName === '首页') {
    // iconName = `ios-information-circle${focused ? '' : '-outline'}`;
    iconName = `ios-home`;
    // We want to add badges to home tab icon
    IconComponent = HomeIconWithBadge;
  } else if (routeName === '录制') {
    iconName = `md-add`;
  }
  else if (routeName === '个人中心') {
    iconName = `md-people`;
  }

  // You can return any component that you like here!
  return <IconComponent name={iconName} size={25} color={tintColor} />;
};

const TabNavigator = createBottomTabNavigator(
    {
      首页: { screen: IndexStack },
      录制: { screen: VideoStack },
      个人中心: { screen: AccountStack },
    },
    {
      //tab默认显示
      // initialRouteName: "首页",
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) =>
          getTabBarIcon(navigation, focused, tintColor),
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    }
);

  const AppNavigator = createStackNavigator(
    {
      Login: LoginStack,
      Home: TabNavigator
    },
    {
      initialRouteName: "Login",
      headerMode: 'none',
      mode: 'modal',
      defaultNavigationOptions: {
        gesturesEnabled: true,
      },
    }
  );


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f58220"
    },
    headView: {
        width: width,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headTitle: {
      padding: 10,
      fontSize: 15,
      color: '#feeeed',
    }
  });
export default createAppContainer(AppNavigator);
