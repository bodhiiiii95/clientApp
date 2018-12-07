import React, { Component } from 'react';
import { Platform,StyleSheet,BackHandler, Image, View,
          TouchableHighlight, Dimensions, AsyncStorage, Animated,Easing} from 'react-native';
import { Container, Header, Content, Footer, 
         FooterTab, Button, Text, InputGroup, Input, List, ListItem,
     	 Card, CardItem, Body, H1} from 'native-base';
import { withNavigation } from 'react-navigation';
import {connect} from 'react-redux';
import BackgroundTimer from 'react-native-background-timer';


var width = Dimensions.get("window").width
var height = Dimensions.get("window").height

let resultParsed = '';
var callingDriver
let counter = 0
var BGTask

/*const intervalId = BackgroundTimer.setInterval(() => {
	if(counter < 125){
		counter = counter + 1
		console.log("waiting")
	}
	else{
		this.props.changeOrderStat(0)
		counter = 0
		this.props.navigate('Ojol')
		console.log("no waiting")
	}
}, 1000);*/

class WaitingScreen1 extends React.Component{

	state={
		driverfound:'0',
	}

	async getKey(){
	    try{
	      const value = await AsyncStorage.getItem('user', (err, result) => {
		        if(result){
		        	resultParsed = JSON.parse(result)
		        }
		        else{
		        	console.log("asyncstorage error")
	        		this.props.navigation.navigate('Login')
	        	}
		    })
	    } catch(error){
	      console.log(error)
	    }
	}

	callDriver = () => {
		BGTask = BackgroundTimer.setInterval(() => {
			if(counter < 40 && this.props.order == 1){
				counter = counter + 1
				this.getNearbyDriver()
			}
			else{
				this.cancelOrder()
			}
		}, 1000)
	}

	animatedBox = () =>{
    this.position = new Animated.ValueXY({x:0, y:0});
      Animated.loop(
        Animated.sequence([
          Animated.decay(this.position, {
              velocity:{x:0, y:-0.3},
              deceleration: 0.985,
          }),
          Animated.spring(this.position, {
            toValue:{x:0, y:0},
            bounciness:12
          }),
        ])
      ).start();
  	}
  

	cancelOrder = () => {
		fetch('http://10.1.3.166:5000/cancel_order', {
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body:JSON.stringify({
	        EmailLogin: resultParsed.Email
	        }),
	      }).then((response) => response.json())
			.then((responseJson) => {
				var APIresponse = responseJson.status
				this.props.changeOrderStat(0)
				counter = 0
				this.props.navigation.navigate('Ojol')
				BackgroundTimer.clearInterval(BGTask)
			})
	}
	

	getNearbyDriver = () =>{
		if(this.props.order == 1){
			fetch('http://10.1.3.166:5000/nearest_driver', {
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body:JSON.stringify({
	        EmailLogin: resultParsed.Email,
	        Longitude: this.props.Longitude,
	        Latitude: this.props.Latitude,
	        LongitudeDestination: this.props.LongitudeDestination,
	        LatitudeDestination: this.props.LatitudeDestination,
	        Price: this.props.Price,
	        }),
	      }).then((response) => response.json())
			.then((responseJson) => {
				var APIresponse = responseJson.status
				if(APIresponse=='201'){
					this.setState({driverfound:'1'},() => {
						console.log("calling driver")
						this.props.navigation.navigate('InOrder')
						BackgroundTimer.clearInterval(BGTask)
					})
			    }
			    else{
			    	this.setState({driverfound:'0'},() => {
						console.log("driver not found")
					})
			    }
			})
		}
		else{
			;
		}
	}

	/*acceptedOrder = () => {
		fetch('http://10.1.3.166:5000/accepted_order', {
    	method: 'POST',
	    headers: {
	      Accept: 'application/json',
	      'Content-Type': 'application/json',
	    },
	    body:JSON.stringify({
	    Email: resultParsed.Email
	    }),
	    }).then((response) => response.json())
	    .then((responseJson) => {
	    	var status = responseJson.status
	    	if(responseJson.status == 200){
	    		this.setState({driverfound:'1'},() => {
					console.log("driver accepted")
					clearInterval(callingDriver)
				})
	    	}
	    	else{
	    		this.setState({driverfound:'0'},() => {
					console.log("driver not accepted")
				})
	    	}
	    })
	    .catch((error) =>{
	    	console.log("error")
	        Toast.show({
	              text: 'No internet Connection',
	              buttonText: 'Okay',
	              duration : 7000
	            })
	    });;
	}*/

	componentWillMount(){
		this.animatedBox()
		this.getKey()
	}

	componentDidMount(){
		this.callDriver()
		//BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
		/*callingDriver = setInterval(() => {
			if(this.state.driverfound == '0'){
				this.getNearbyDriver()
			}
			else if(this.state.driverfound == '1'){
				this.acceptedOrder()
			}
		}, 1000)*/
	}

	componentWillUnmount() {
        //BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

	handleBackButton() {
		console.log("back button pressed")
        return true;
    }

	render(){
		return(
			<Container>
				<View style={styles.container}>
					<View>
						<Animated.View style={ this.position.getLayout()}>
							<Image source={require('./src/driver.png')} 
			            	style = {styles.image} />
			            </Animated.View>
		            <View>
		            <View style={{height:20}}>
		            </View>
		            <View style={{alignSelf:'center'}}>
		            	<Text>WAITING FOR DRIVER</Text>
		            </View>
		            <View style={{height:20}}>
		            </View>
		            </View>
		            	<Button style = {styles.cancelButton} onPress={() => this.cancelOrder()}><Text>Cancer Order</Text></Button>
		            </View>
				</View>
			</Container>
			)
	}
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		height:height,
		width:width,
		backgroundColor:'white',
		justifyContent:'center',
		alignItems:'center',
	},
	image:{
		width: 60.5, 
		height: 75, 
		justifyContent:'center', 
		alignSelf:'center',
	},
	cancelButton:{
		width:300,
		height:75,
		justifyContent:'center', 
		alignSelf:'center',
		backgroundColor:'black',
		borderRadius:500,
	}
})


const mapStateToProps = (state) =>{
	return{
		Longitude:state.reducer.Longitude,
		Latitude:state.reducer.Latitude,
		LongitudeDestination:state.reducer.LongitudeDestination,
		LatitudeDestination:state.reducer.LatitudeDestination,
		Price:state.reducer.Price,
		order:state.reducer.order,
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
		},
		changeOrderStat : (order) => {
			dispatch({type:'CHANGE_ORDER', payload:order})
		}
	}
}

const WaitingScreen = connect(mapStateToProps, mapDispatchToProps)(WaitingScreen1);

export default withNavigation(WaitingScreen);