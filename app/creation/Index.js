import React, { Component } from "react";

import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  ImageBackground,
  TouchableHighlight,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {ListRow, Input, Button, Drawer, Label, Toast, Theme} from 'teaset';

import Item from './Item';
import Detail from './Detail';

// 公共组件
import TitleHead from '../common/TitleHead';
const config = require('../common/config');
const request = require('../common/request');

//缓存数据
let cacheResult = {
  nextPage:1,
  items:[],
};

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      // 下拉刷新
      isRefresh: false,
      // 加载更多
      isLoadMore: false,
      // 控制foot  1：正在加载   2 ：无更多数据
      showFoot: 1,
      user: '',           //用户信息
      rootTransform: 'none',
    };

    // 在ES6中，如果在自定义的函数里使用了this关键字，则需要对其进行“绑定”操作，否则this的指向会变为空
    // 像下面这行代码一样，在constructor中使用bind是其中一种做法（还有一些其他做法，如使用箭头函数等）
    this._fetchData = this._fetchData.bind(this);
    this._renderRow = this._renderRow.bind(this);

  }
  //定义header头部
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <TitleHead name='视频列表' styleType="indexHeadTitle" />,
      headerStyle: {
        backgroundColor: '#ef4136',
      },
      headerLeft: (
        <Icon name="ios-menu" size={30} style={styles.menuIcon} onPress={navigation.getParam('showMenu')} />
      ),
    };
  };

  //打开即开始预加载数据
  componentDidMount() {
    //读取本地存储用户信息
    this._retrieveData();
    //绑定路由
    this.props.navigation.setParams({ showMenu: this._showMenu });
  }

  //读取数据
  _retrieveData = async () => {
    let that = this;
    try {
      const user = await AsyncStorage.getItem('user');
      if (user !== null) {
        that.setState({
          user:JSON.parse(user)
        });
        that._fetchData(cacheResult.nextPage);
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

  //删除数据
  _removeValue = async (key) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch(e) {
      // remove error
    }
  }

  //获取列表数据
  _fetchData = (page) => {
    const video_list_url = config.domain.http + config.domain.video_list;
    this.setState({
      isLoadMore:true
    });
    let body =  {
      token:this.state.user.token,
      page:page
    };
    request.get(video_list_url, body)
    .then(data => {
      if(data.code === 1){
        let items = cacheResult.items.slice();
        items = items.concat(data.data);
        cacheResult.items = items;
        //返回的数据长度，如果为0，说明已经加载完毕
        if(data.data.length == 0){
          this.setState({
            showFoot:2
          });
        }
        this.setState({
          isLoadMore: false,
          dataSource: cacheResult.items
        });
      }else{
        this._onLogout();
      }
    })
    .catch((error)=>{
      console.warn(error);
    })
  }

  //侧滑展示菜单
  _showMenu = () => {
    let {rootTransform} = this.state;
    let side = 'left';
    this.drawer = Drawer.open(this.renderDrawerMenu(), side, rootTransform);
  }

  //菜单内容
  renderDrawerMenu() {
    return (
      <View style={{backgroundColor: "Theme.defaultColor", width: 260, flex: 1}}>
        <View style={{height: 60}} />
        <ListRow
          icon={
            <View style={{paddingRight: 12}}>
              <Image style={{width: 30, height: 30, tintColor: Theme.primaryColor}} source={require('../../icons/me_active.png')} />
            </View>
          }
          title={this.state.user.username}
          />
        <ListRow
          icon={require('../../icons/home_active.png')}
          title='我的视频'
          onPress={()=>{Toast.smile('正在开发。。。')}}
          />
        <ListRow
          icon={require('../../icons/store_active.png')}
          title='账户管理'
          onPress={()=>{Toast.sad('下一版开发。。。')}}
          />
        <ListRow
          icon={require('../../icons/goback.png')}
          bottomSeparator='none'
          title='返回登录首页'
          onPress={()=>{this._onLogout() && this.drawer.close() }}
          />
        <View style={{flex: 1}} />
        <Button type='link' size='md' title='关闭' onPress={() => this.drawer && this.drawer.close()} />
      </View>
    );
  }

  //登出
  _onLogout = async() => {
    //删除用户缓存数据
    try {
      await AsyncStorage.removeItem('user');
      this.props.navigation.navigate('Login');
      Toast.info("登录失效");
    } catch(e) {
      console.log('err:',e);
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          //加载列表数据
          data={this.state.dataSource}
          //列表样式
          style={styles.list}
          //列表布局
          renderItem={this._renderRow}

          //加载更多
          onEndReached = {()=>this._onloadMore()}
          //离底部多远（像素）开始预加载
          onEndReachedThreshold={10}

          //添加头部布局
          //ListHeaderComponent={this._createListHeader}
          //添加尾部布局：也就是旋转的小菊花
          // ListFooterComponent={this._createListFooter}
          ListFooterComponent={this._createListFooter.bind(this)}

          //下拉刷新相关
          //onRefresh={() => this._onRefresh()}
          refreshControl={
              <RefreshControl
                  title={'Loading'}
                  colors={['red']}
                  refreshing={this.state.isRefresh}
                  onRefresh={() => {
                      this._onRefresh();
                  }}
              />
          }

          //分割线
          ItemSeparatorComponent={this._separator}
          keyExtractor={item => item.id.toString()}
        />
      </SafeAreaView>
    );
  }

  _renderRow({ item }) {
    // { item }是一种“解构”写法，请阅读ES2015语法的相关文档
    // item也是FlatList中固定的参数名，请阅读FlatList的相关文档
    console.log('renderRowitem:', item);
    return <Item key={item.id} item={item} user={this.state.user} />
  }

  _onloadMore(){
    // 不处于正在加载更多 && 有下拉刷新过，因为没数据的时候 会触发加载
    if(!this.state.isLoadMore && this.state.showFoot !== 2){
      cacheResult.nextPage = cacheResult.nextPage+1;
      this._fetchData(cacheResult.nextPage);
    }
  }

  /**
   * 创建头部布局
   */
  _createListHeader() {
      return (
          <View style={styles.headView}>
              <Text style={{color: 'white'}}>
                  头部布局
              </Text>
          </View>
      )
  }

  /**
   * 创建尾部布局
   */
  _createListFooter = () => {
      return (
          <View style={styles.footerView}>
              {this.state.showFoot === 1 && <ActivityIndicator/>}
              <Text style={{color: 'red'}}>
                  {this.state.showFoot === 1 ? '正在努力加载...' : '这已经是我的底线了哦！'}
              </Text>
          </View>
      )
  }

  /**
   * 下啦刷新
   * @private
   */
  _onRefresh = () => {
      // 不处于 下拉刷新
      if (!this.state.isRefresh) {
          cacheResult = {
            nextPage:1,
            items:[],
          };
          this.setState({
            showFoot:1,
            dataSource: cacheResult.items
          });
          this._fetchData(cacheResult.nextPage)
      }
  }

  /**
   * 分割线
   */
  _separator() {
      return <View style={{height: 1, backgroundColor: '#999999'}}/>;
  }

}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  headView: {
      width: width,
      height: 50,
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center'
  },
  footerView: {
      flexDirection: 'row',
      width: width,
      height: 50,
      //backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center'
  },
  item:{
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  list: {
    paddingTop: 20,
    backgroundColor: "#F5FCFF"
  },
  menuIcon:{
    paddingLeft:width/20,
    color:'#feeeed'
  }
});
