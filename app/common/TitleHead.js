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

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

export default class TitleHead extends React.Component {
  constructor(props) {
    super(props);
    let styleType = this.props.styleType ? this.props.styleType : 'headTitle';
    this.state = {
      styleType: styleType,
    };
  }

  render() {
    return (
      <View style={styles.headView}>
        {
          this.state.styleType == 'indexHeadTitle'
          ?
          <Text style={styles.indexHeadTitle}>
              {this.props.name}
          </Text>
          :
          this.state.styleType == 'loginHeadTitle'
          ?
          <Text style={styles.loginHeadTitle}>
              {this.props.name}
          </Text>
          :
          <Text style={styles.headTitle}>
              {this.props.name}
          </Text>
        }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f58220"
  },
  headView: {
      width: width,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center'
  },
  headTitle: {
    padding: 10,
    fontSize: 16,
    color: '#feeeed',
  },
  loginHeadTitle:{
    paddingRight:width/10 ,
    fontSize: 18
  },
  indexHeadTitle:{
    paddingRight:width/4,
    fontSize: 16,
    color: '#feeeed',
  }
});
