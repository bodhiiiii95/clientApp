import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import {
  Platform,
  StyleSheet,
  Animated,
  View,
  BackHandler,
  Image, AsyncStorage,
} from 'react-native';
import { Container, 
  Header, Button, Text, Content, Form, Item, Segment,
  Input, Label, Body, Icon, Tab, Tabs, Toast, Root 
} from 'native-base';

class SplashApp extends React.Component {

	checkStatus = (EmailUser) => {
		fetch('http://10.1.3.166:5000/status_user', {
	      method: 'POST',
	      headers: {
	        Accept: 'application/json',
	        'Content-Type': 'application/json',
	      },
	      body:JSON.stringify({
	      Email: EmailUser,
	      }),
	    })
	    .then((response) => response.json())
		.then((responseJson) => {
		  var status = responseJson.status
		  console.log(status)
		  if(status == 200){
		  	this.props.navigation.navigate('InOrder')
		  }
		  else if(status == 404){
		  	this.props.navigation.navigate('Menu')
		  }
		})
	}

	async getKey(){
	    try{
	      const value = await AsyncStorage.getItem('user', (err, result) => {
	        if(result){
	          let resultParsed = JSON.parse(result)
	          fetch('http://10.1.3.166:5000/login', {
	            method: 'POST',
	            headers: {
	              Accept: 'application/json',
	              'Content-Type': 'application/json',
	            },
	            body:JSON.stringify({
	            EmailLogin: resultParsed.Email,
	            PasswordLogin: resultParsed.Pass,
	            }),
	          }).then((response) => response.json())
	          .then((responseJson) => {
	            var APIresponse = responseJson.status
	            if(APIresponse==300){
	              Toast.show({
	                    text: 'Welcome back',
	                    buttonText: 'Okay',
	                    duration : 7000
	                  })
	              this.checkStatus(resultParsed.Email)
	            }
	            else if(APIresponse==301){
	              Toast.show({
	                    text: 'Email or password may be invalid',
	                    buttonText: 'Okay',
	                    duration : 4000
	                  })
	              this.props.navigation.navigate('Home')
	            }
	          }).catch((error) =>{
	              Toast.show({
	                    text: 'Cannot Reach Server',
	                    buttonText: 'Okay',
	                    duration : 7000
	                  })
	              this.props.navigation.navigate('Home')
	            });;
	        }
	        else{
	        	this.props.navigation.navigate('Home')
	        }
	      })
	    } catch(error){
	      console.log(error)
	    }
  	}

  	componentDidMount(){
  		this.timeoutHandle = setTimeout(()=>{
			this.getKey()
     	}, 10);
  	}
  	
	componentWillUnmount(){
		clearTimeout(this.timeoutHandle)
	}

	render(){
		return(
			<Root>
				<Container style = {[styles.container, { backgroundColor: '#000000' }]}>
	            	<Image source={require('./src/img/logo.png')} 
	            	style = {{ width: 121, height: 150 }} />
	        	</Container>
	        </Root>
		);
	}
}

const styles = StyleSheet.create(
{
    container:
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: (Platform.OS == 'ios') ? 20 : 0
    },
 
    text:
    {
        color: 'white',
        fontSize: 25
    }
});

export default withNavigation(SplashApp);