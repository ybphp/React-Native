import React, { Component } from "react";
import {
  TouchableOpacity,
  Image,
  ImageBackground,
  TouchableHighlight,
  Alert,
  StyleSheet,
  Text,
  View
} from "react-native";

import {Theme, NavigationPage, ListRow, Label, SegmentedBar, TabView, SegmentedView, Carousel} from 'teaset';

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

export default class TabViewBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name
    };
  }

  render() {
    return (
      <View style={{padding: 1}} pointerEvents='none'>
        {
          this.state.name==='我的信息' ?
            <TabView.Button title={this.state.name} style={{height: 45}} icon={require('../../icons/user_128px.png')} />
          : this.state.name==='我的视频'
            ? <TabView.Button title={this.state.name} style={{height: 45}} icon={require('../../icons/video_camera.png')} />
            : this.state.name==='我的收藏'
              ? <TabView.Button title={this.state.name} style={{height: 45}} icon={require('../../icons/love.png')} />
              : <TabView.Button title={this.state.name} style={{height: 45}} icon={require('../../icons/home_96px.png')} />
        }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f58220"
  }
});
