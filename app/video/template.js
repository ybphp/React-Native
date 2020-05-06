import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');


export default class Edit extends Component {

    constructor(props) {
        super(props);
        //当前页
        this.page = 1
        //状态
        this.state = {
            // 列表数据结构
            dataSource: [],
            // 下拉刷新
            isRefresh: false,
            // 加载更多
            isLoadMore: false,
            // 控制foot  1：正在加载   2 ：无更多数据
            showFoot: 1,
        }
    }

    /**
     * 获取360 下载列表
     * @private
     */
    _getHotList() {
        this.state.isLoadMore = true
        fetch("http://m.app.haosou.com/index/getData?type=1&page=" + this.page)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                if (this.page === 1) {
                    console.log("重新加载")
                    this.setState({
                        isLoadMore: false,
                        dataSource: responseJson.list
                    })
                } else {
                    console.log("加载更多")
                    this.setState({
                        isLoadMore: false,
                        // 数据源刷新 add
                        dataSource: this.state.dataSource.concat(responseJson.list)
                    })
                    if (this.page <= 3) {
                        this.setState({
                            showFoot: 1
                        })
                    } else if (this.page > 3) {
                        this.setState({
                            showFoot: 2
                        })
                    }
                }


            })
            .catch((error) => {
                console.error(error);
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.container}
                    data={this.state.dataSource}
                    //item显示的布局
                    renderItem={({item}) => this._createListItem(item)}
                    // 空布局
                    ListEmptyComponent={this._createEmptyView}
                    //添加头尾布局
                    ListHeaderComponent={this._createListHeader}
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
                    refreshing={this.state.isRefresh}
                    //加载更多
                    onEndReached={() => this._onLoadMore()}
                    onEndReachedThreshold={0.1}
                    ItemSeparatorComponent={this._separator}
                    keyExtractor={this._extraUniqueKey}
                />
            </View>
        );
    }

    _extraUniqueKey(item, index) {
        return "index" + index + item;
    }

    /**
     * 分割线
     */
    _separator() {
        return <View style={{height: 1, backgroundColor: '#999999'}}/>;
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
                    {this.state.showFoot === 1 ? '正在加载更多数据...' : '没有更多数据了'}
                </Text>
            </View>
        )
    }


    /**
     * 创建布局
     */
    _createListItem(item) {
        return (
            <TouchableOpacity activeOpacity={0.5} onPress={() => this._onItemClick(item)}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // justifyContent: 'center',
                    marginTop: 5,
                    backgroundColor: '#fff',
                    padding: 10
                }}>
                    <Image source={{uri: item.logo_url}} style={styles.itemImages}/>
                    <Text style={{marginLeft: 6}}>
                        {item.baike_name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * 空布局
     */
    _createEmptyView() {
        return (
            <View style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 16}}>
                    暂无列表数据，下啦刷新
                </Text>
            </View>
        );
    }

    /**
     * 下啦刷新
     * @private
     */
    _onRefresh = () => {
        // 不处于 下拉刷新
        if (!this.state.isRefresh) {
            this.page = 1
            this._getHotList()
        }
    };

    /**
     * 加载更多
     * @private
     */
    _onLoadMore() {
        // 不处于正在加载更多 && 有下拉刷新过，因为没数据的时候 会触发加载
        if (!this.state.isLoadMore && this.state.dataSource.length > 0 && this.state.showFoot !== 2) {
            this.page = this.page + 1
            this._getHotList()
        }
    }

    /**
     * item点击事件
     */
    _onItemClick(item) {
        console.log("page" + this.state.page + " = " + item.baike_name)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    itemImages: {
        width: 60,
        height: 60,
        resizeMode: 'stretch'
    },
});
