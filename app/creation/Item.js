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

import { withNavigation } from 'react-navigation';
import {ListRow, Input, Button, Label, Toast} from 'teaset';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';

var config = require('../common/config');
var request = require('../common/request');

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.item,
      user: this.props.user,
    };
  }
  render() {
    let item = this.state.item;
    let user = this.state.user;
    return (
      <TouchableHighlight>
        <View style={styles.item} >
          <Text style={styles.title}>{item.video_name}</Text>
          <ImageBackground source={{ uri: item.image_path }} style={styles.thumbnail}>
            <Icon name="ios-play" size={28} style={styles.play}
            onPress={() => this.props.navigation.navigate('Detail',{item, user})}/>
          </ImageBackground>
          <View style={styles.itemFooter}>
              <View style={styles.handleBox}>
                <Icon
                  name={item.like_type == 1 ? "ios-heart" : "ios-heart-empty"}
                  size={28}
                  style={[styles.upIcon, item.like_type == 1 ? styles.downIcon : null]}
                  onPress={this._upIcon}
                />
                <Text style={styles.handleText} onPress={this._upIcon}>喜欢</Text>
              </View>
              <View style={styles.handleBox}>
                <Icon name="md-film" size={28} style={styles.commentIcon} />
                <Text style={styles.handleText}>播放{item.play_volume}</Text>
              </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  /**
   * 点赞
   */
  _upIcon=()=>{
    var url = config.domain.http + config.domain.video_zan
    let item = this.state.item;
    let like_type = item.like_type;
    let that = this;
    let msg = '';
    var body = {
      video_id: item.id,
      token:that.state.user.token
    }
    request.get(url, body)
    .then(function(data){
      if(data.code == 1){
        if(item.like_type == 1){
          item.like_type = 0;
          msg = '取消收藏';
        }else{
          item.like_type = 1;
          msg = '收藏成功';
        }
        that.setState({
          item: item
        });
        Toast.smile(msg);
      }else{
        Toast.sad('收藏失败，请重试！')
      }
    })
  }

  //读取数据
  _retrieveData = async () => {
    let that = this;
    try {
      let user = await AsyncStorage.getItem('user');
      if (user !== null) {
        user = JSON.parse(user);
        that.setState({
          user:user
        });
      }
     } catch (error) {
       // Error retrieving data
       console.log('usererror:', error);
     }
  }


}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  item:{
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  thumbnail:{
    width: width,
    height: width * 0.56,
    resizeMode: 'cover',
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333',
  },
  itemFooter:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
  },
  handleBox:{
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: width/2 - 0.5,
    backgroundColor: '#fff',
  },
  handleText:{
    paddingLeft: 10,
    fontSize: 18,
    color: '#333',
  },
  commentIcon:{
    fontSize: 20,
    color: '#333',
  },
  play:{
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66',
  },
  list: {
    paddingTop: 20,
    backgroundColor: "#F5FCFF"
  },
  //点赞
  upIcon:{
    fontSize: 22,
    color: '#333',
  },
  //取消赞
  downIcon:{
    fontSize:22,
    color:'#ed7b66'
  }
});
export default withNavigation(Item);
