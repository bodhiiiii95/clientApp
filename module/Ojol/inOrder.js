import React, { Component } from 'react';
import { Platform,StyleSheet,BackHandler, Image, View,
          TouchableHighlight, Dimensions, AsyncStorage,
      	ImageBackground} from 'react-native';
import { Container, Header, Content, Footer, 
         FooterTab, Button, Text, InputGroup, Input, List, ListItem,
     	 Card, CardItem, Body, H1, Drawer} from 'native-base';
import { withNavigation } from 'react-navigation';
import MapView, { Marker } from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';
import MapViewDirections from 'react-native-maps-directions';
import geolib from 'geolib';
import {connect} from 'react-redux';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/FontAwesome';

var resultParsed
const width = Dimensions.get("window").width
const height = Dimensions.get("window").height
var DriverPos

class InOrder1 extends React.Component{

	state = {
		driver_long:0,
		driver_lat:0,
		longitude:0,
		latitude:0,
		driver_name:'',
		driver_phone:0,
		star:0,
		buttonDesc:'',
		disableRating:true,
		vehicle_number:'0',
		vehicle_type:'',
	}

	getLocationNow = () =>{
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.setState({latitude:position.coords.latitude})
				this.setState({longitude:position.coords.longitude})
			},
			(error) => console.log(error.message.toString()),
			{ enableHighAccuracy: false, timeout: 20000, maximumAge:1000 }
		)

	}

	onStarRatingPress(rating) {
	    this.setState({
	      star: rating
	    });
	  }

	buttonAction = () => {
		if(this.state.buttonDesc === 'Cancel Order'){
			this.cancelTrip()
		}
		else if(this.state.buttonDesc === 'End Trip'){
			this.endTrip()
		}
		else if(this.state.buttonDesc === 'Give Rating'){
			this.giveRating()
		}
	}

	cancelTrip = () => {
		fetch('http://10.1.3.166:5000/cancel_trip', {
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body:JSON.stringify({
	        EmailUser: resultParsed.Email
	        }),
	      }).then((response) => response.json())
			.then((responseJson) => {
				clearInterval(DriverPos)
				this.props.navigation.navigate('Menu')
		})
	}

	endTrip = () => {
		fetch('http://10.1.3.166:5000/end_trip', {
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body:JSON.stringify({
	        EmailUser: resultParsed.Email
	        }),
	      }).then((response) => response.json())
			.then((responseJson) => {
				clearInterval(DriverPos)
				this.setState({buttonDesc:'Give Rating', disableRating:false})
		})
	}

	giveRating = () => {
		fetch('http://10.1.3.166:5000/give_rating', {
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body:JSON.stringify({
	        EmailUser: resultParsed.Email,
	        Rating: this.state.star
	        }),
	      }).then((response) => response.json())
			.then((responseJson) => {
				this.setState({buttonDesc:'Cancel Order'})
				this.props.navigation.navigate('Menu')
		})
	}

	getDriverPos = () => {
		fetch('http://10.1.3.166:5000/live_driver', {
	        method: 'POST',
	        headers: {
	          Accept: 'application/json',
	          'Content-Type': 'application/json',
	        },
	        body:JSON.stringify({
	        EmailUser: resultParsed.Email
	        }),
	      }).then((response) => response.json())
			.then((responseJson) => {
				this.setState({driver_long:responseJson.longi})
				this.setState({driver_lat:responseJson.lati, vehicle_type:responseJson.vehicle_type, vehicle_number:responseJson.vehicle_number})
				this.setState({driver_name:responseJson.driver_name, driver_phone:responseJson.driver_phone, star:responseJson.rating})
				if(responseJson.stat == 1){
					this.setState({buttonDesc:'Cancel Order'})
				}
				else if(responseJson.stat == 2){
					this.setState({buttonDesc:'End Trip'})
				}
				else if(responseJson.stat == 3){
					clearInterval(DriverPos)
					this.setState({buttonDesc:'Give Rating', disableRating:false})
				}
			})
	}

	async getKey(){
	    try{
	      const value = await AsyncStorage.getItem('user', (err, result) => {
		        if(result){
		        	resultParsed = JSON.parse(result)
		        }
		        else{
	        		this.props.navigation.navigate('Login')
	        	}
		    })
	    } catch(error){
	      console.log(error)
	    }
	}

	componentWillMount(){
		this.getKey()
	}

	componentDidMount(){
		var getCurrent = setInterval(() => {
			this.getLocationNow()
			if(this.state.longitude != 0 && this.state.latitude != 0){
				clearInterval(getCurrent)
			}
			else{
				this.getLocationNow()
			}
		}, 300)

		DriverPos = setInterval(() => {
			this.getDriverPos()
		}, 3000)
	}

	render(){
		return(
			<Container>
				<View style={styles.container}>
					<MapView
						style={styles.map}
						region={{
							latitude: this.state.latitude,
							longitude: this.state.longitude,
							latitudeDelta: 0.015,
							longitudeDelta: 0.0121,
						}}
						showsUserLocation={true}
					>
					<MapView.Marker
						coordinate={
							{latitude:this.state.driver_lat, longitude:this.state.driver_long}
						} />
					</MapView>
				</View>
				<View style={styles.detailContainer}>
		   			<Card style={styles.card}>
			   			<View style={styles.orderDetails}>
			   				<CardItem>
			   					<Body style={{alignContent:'flex-start', justifyContent:'flex-start'}}>
				   					<View style={{flexDirection: 'row'}}>
					   					<View style={{flex:0.5}}>
					   						<View>
					   							<H1 style={styles.orderDetailsText}>{this.state.vehicle_number}</H1>
					   						</View>
					   						<View style={{height:10}}>
					   							
					   						</View>
					   						<View>
					   							<Text>{this.state.driver_name}</Text>
					   							<Text>{this.state.vehicle_type}</Text>
					   						</View>
					   					</View>
					   					<ImageBackground source={require('./picture/Eko.jpg')} style={{flex:0.5, width: '100%', height: '100%'}} imageStyle={{ borderRadius: 100 }}>
					   						
					   						
					   					</ImageBackground>
					   				</View>
			   					</Body>
			   				</CardItem>
			   				<CardItem>
			   					<Body style={styles.ratingView}>
			   						<StarRating
			   						containerStyle={styles.ratingDriver}
							        disabled={false}
							        maxStars={5}
							        starSize={20}
							        rating={this.state.star}
							        disabled={this.state.disableRating}
							        selectedStar={(rating) => this.onStarRatingPress(rating)} />
							        <Text>{this.state.star}</Text>
			   					</Body>
			   				</CardItem>
			   				<CardItem>
			   					<Body>
			   						<Button block style={styles.buttonOrderDetails} onPress={() => {this.buttonAction()}}>
			   							<Text>{this.state.buttonDesc}</Text>
			   						</Button>
			   					</Body>
			   				</CardItem>
			   			</View>
		   			</Card>
		   		</View>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex:1,
		height: height,
		width: width,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	detailContainer:{
	 	justifyContent:'flex-end',
	},
	ratingDriver:{
		alignSelf:'center',
	},
	ratingView:{
		flexDirection: 'row',
		justifyContent:'center',
	},
	card:{
		height: 250,
		width:width-20,
		marginLeft:10,
		marginRight:10,
	},
	orderDetails:{
		flex:1,
		alignItems:'center',
		justifyContent:'flex-end',
	},
	buttonOrderDetails:{
		alignSelf:'center',
		height:55,
		width:width-50,
		backgroundColor:'black'
	},
	orderDetailsText:{
		
	},
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

const InOrder = connect(mapStateToProps, mapDispatchToProps)(InOrder1);

export default withNavigation(InOrder);