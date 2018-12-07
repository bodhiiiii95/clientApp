import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { Button, View, Text } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from 'react-redux';
import LoginApp from './Login/main.js';
import MenuApp from './Menu/main.js';
import SplashApp from './SplashScreen/splash.js';
import OjolApp from './Ojol/main.js';
import WaitingScreen from './Ojol/waiting.js';
import InOrder from './Ojol/inOrder.js';

class InOrderScreen extends React.Component{
  static navigationOptions = {
    title: 'inOrder',
    header:null,
  }
  render(){
    return <InOrder />;
  }
}

class WaitingScreens extends React.Component{
  static navigationOptions = {
    title: 'wait',
    header:null,
  }
  render(){
    return <WaitingScreen />;
  }
}

class OjolScreen extends React.Component{
	static navigationOptions = {
    	title: 'Ride',
    	header: null,
  	};
	render(){
		return (<OjolApp />);
	}
}

class SplashScreen extends React.Component{
	static navigationOptions = {
    	title: 'Splash',
    	header: null,
  	};
	render(){
		return (<SplashApp />);
	}
}

class LoginScreen extends React.Component{
	static navigationOptions = {
    	title: 'Home',
    	header: null,
  	};
	render(){
		return (<LoginApp />);
	}
}

class MenuScreen extends React.Component{
	static navigationOptions = {
    	title: 'Menu',
    	header: null,
  	};
	render(){
		return (<MenuApp />);
	}
}

const RootStack = createStackNavigator(
  {
    Home: LoginScreen,
    Menu: MenuScreen,
    Splash: SplashScreen,
    Ojol: OjolScreen,
    Wait: WaitingScreens,
    InOrder: InOrderScreen,
  },
  {
    initialRouteName: 'Splash'
  }
);

export default class WrapperApp extends React.Component{
	render(){
		return(
      <Provider store={store}>
        <RootStack />
      </Provider>
    ); 
	}
}

/*---------------------- Redux Area -----------------------*/

const orderState = {
  Longitude:'0',
  Latitude:0,
  LongitudeDestination:0,
  LatitudeDestination:0,
  Price:0,
  order:0
}
  


const reducer = (state = orderState, action) => {
  switch (action.type){
    case "LONG":
      state = {
        ...state,
        Longitude:action.payload
      }
      break;
    case "LAT":
      state = {
        ...state,
        Latitude:action.payload
      }
      break;
    case "DESTLONG":
      state = {
        ...state,
        LongitudeDestination:action.payload,
      }
      break;
    case "DESTLAT":
      state = {
        ...state,
        LatitudeDestination:action.payload,
      }
      break;
    case "PRICE":
      state = {
        ...state,
        Price:action.payload,
      }
      break;
    case "CHANGE_ORDER":
      state = {
        ...state,
        order:action.payload,
      }
      break;
  }
  return state;
}

const store = createStore(combineReducers({reducer}),
  {},
  applyMiddleware(loggers))

const myLogger = (store) => (next) => (action) =>{
  console.log(action);
  next(action)
}

function loggers({ getState }) {
  return next => action => {
    //console.log('will dispatch', action)
    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)
    //console.log('state after dispatch', getState())

    if (action.type == "ORDER"){
      console.log("ini update latitude")
    }
    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

/*--------------------------- Redux Area ------------------------------*/