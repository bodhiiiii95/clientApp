/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform,StyleSheet,BackHandler, Image, View,
          TouchableHighlight,} from 'react-native';
import { Container, Header, Content, Footer, 
         FooterTab, Button, Text, Icon, Left, Body, Right,
         Title, Drawer} from 'native-base';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {AppRegistry} from 'react-native';
import SideBar from './drawer.js'

class MenuApp1 extends React.Component {

  ojol = () => {
    this.props.navigation.navigate('Ojol')
  }

  nebeng = () => {
    console.log("nebeng")
  }

  comingsoon = () =>{
    console.log("coming soon")
  }

  componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton() {
      this.props.navigation.navigate('Ojol');
      return true;
  }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  render() {
    return (
      <Drawer
      ref={(ref) => { this.drawer = ref; }}
      content={<SideBar navigator={this.navigator} />}
      onClose={() => this.closeDrawer()} >
        <Container>
          <Header style={{backgroundColor:'black'}}>
          <Left style={{flex:1}}>
            <Button transparent onPress={() => this.openDrawer()}>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body style={{flex:1}}>
            <Title>Header</Title>
          </Body>
          <Right style={{flex:1}}/>
          </Header>
          <View style={styles.container}>
            <TouchableHighlight onPress={() => this.ojol()} style={styles.menuBox}>
              <View>
                <Image source={require('./src/img/logo/logo1.png')} style={styles.icon} />
                <Text style={styles.info}>Ride</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight onPress={() => this.nebeng()} style={styles.menuBox}>
              <View>
                <Image source={require('./src/img/logo/logo2.png')} style={styles.icon} />
                <Text style={styles.info}>Car</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight onPress={() => this.comingsoon()} style={styles.menuBox}>
              <View>
                <Image source={require('./src/img/logo/logo3.png')} style={styles.icon}/>
                <Text style={styles.info}>Hitch</Text>
              </View>
            </TouchableHighlight>

          </View>
        </Container>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBox:{
    backgroundColor: "#DCDCDC",
    flex:0.3,
    width:100,
    height:90,
    alignItems: 'center',
    justifyContent: 'center',
    margin:12,
    borderRadius:15,
    backgroundColor:'rgba(52, 52, 52, 0)'
  },
  icon:{
    width:60,
    height:60,
  },
  info:{
    fontSize:20,
    alignSelf:'center',
    color:'#000000'
  },
  comingSoonInfo:{
    fontSize:15,
    alignSelf:'center',
    color:'#000000'
  }
});

const mapStateToProps = (state) =>{
  return{
    Longitude:state.reducer.Longitude,
    Latitude:state.reducer.Latitude,
    LongitudeDestination:state.reducer.LongitudeDestination,
    LatitudeDestination:state.reducer.LatitudeDestination,
    Price:state.reducer.Price
  }
}

const mapDispatchToProps = (dispatch) => {
  return{
    changeData : (longi, lati, destlong, destlat , price) =>{
      dispatch({type:'LONG', payload:longi}),
      dispatch({type:'LAT', payload:lati}),
      dispatch({type:'DESTLONG', payload:destlong}),
      dispatch({type:'DESTLAT', payload:destlat}),
      dispatch({type:'PRICE', payload:price})
    }
  }
}

const MenuApp = connect(mapStateToProps, mapDispatchToProps)(MenuApp1);

export default withNavigation(MenuApp);