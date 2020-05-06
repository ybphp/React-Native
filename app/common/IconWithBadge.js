// Tab图标组件

import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';

const config = require('./config');
const request = require('./request');

export default class IconWithBadge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      badgeCount:0
    };
  }

  componentDidMount() {
    this._getBadgeCount();
  }

  //获取未读视频数
  _getBadgeCount = async() =>{
    let url   =   config.domain.http + config.domain.video_badge_count;
    let user = await AsyncStorage.getItem('user');
    let count = 0;
    if (user != null) {
      user = JSON.parse(user);
      let body  =   {token: user.token};
      request.get(url, body)
      .then(data => {
        if(data.code === 1){
          this.setState({
            badgeCount:data.data.count
          })
        }
      })
    }
  };

  render() {
    const { name, badgeCount, color, size } = this.props;
    return (
      <View style={{ width: 24, height: 24, margin: 5 }}>
        <Ionicons name={name} size={size} color={color} />
        {this.state.badgeCount > 0 && (
          <View
            style={{
              // /If you're using react-native < 0.57 overflow outside of the parent
              // will not work on Android, see https://git.io/fhLJ8
              position: 'absolute',
              right: -6,
              top: -3,
              backgroundColor: 'red',
              borderRadius: 6,
              width: 12,
              height: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {this.state.badgeCount}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
