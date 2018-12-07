import React, { Component } from 'react';
import { Platform,StyleSheet,BackHandler, Image, View,
          TouchableHighlight, Dimensions, AsyncStorage} from 'react-native';
import { Container, Header, Content, Footer, 
         FooterTab, Button, Text, InputGroup, Input, List, ListItem,
     	 Card, CardItem, Body, H1, Icon, Left, Right, Title} from 'native-base';
import { withNavigation } from 'react-navigation';
import MapView, { Marker } from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';
import MapViewDirections from 'react-native-maps-directions';
import geolib from 'geolib';
import {connect} from 'react-redux';

var width = Dimensions.get("window").width
var height = Dimensions.get("window").height
var autoComplete, typeText
let textPickUp = null
var placePrediction = []
const GOOGLE_MAPS_APIKEY = 'AIzaSyCa6N-Wep6IZoOwhPhNk2RsCMjIKFtyGk0';
let i = 0
const animatedFunc = require('react-native-maps')

class OjolApp1 extends React.Component{
	
	constructor() {
        super()
        this.map = null;
    }

	state={
		pickUpText:"",
		pickUpTextShow:"",
		pickUpList:[],
		pickUp:false,
		pickUpLatitude:0,
		pickUpLongitude:0,
		pickUpEditMode:true,

		dropOffText:"",
		dropOffTextShow:"",
		dropOffList:[],
		dropOff:false,
		dropOffLatitude:0,
		dropOffLongitude:0,

		type:"",
		dropOffReady:false,

		detailShow:false,
		mapEdit:true,
		price:0,
		distance:0,
	}

	async getNearbyDriver(){
		try{
			const value = await AsyncStorage.getItem('user', (err, result) => {
				if(result){
					this.props.changeOrderStat(1)
		            this.props.changeData(this.state.pickUpLongitude,this.state.pickUpLatitude,this.state.dropOffLongitude,
		            	this.state.dropOffLatitude,this.state.price)

					let resultParsed = JSON.parse(result)
					fetch('http://10.1.3.166:5000/nearest_driver', {
		            method: 'POST',
		            headers: {
		              Accept: 'application/json',
		              'Content-Type': 'application/json',
		            },
		            body:JSON.stringify({
		            EmailLogin: resultParsed.Email,
		            Longitude: this.state.pickUpLongitude,
		            Latitude: this.state.pickUpLatitude,
		            LongitudeDestination: this.state.dropOffLongitude,
		            LatitudeDestination: this.state.dropOffLatitude,
		            Price: this.state.price,
		            }),
		          }).then((response) => response.json())
					.then((responseJson) => {
						var APIresponse = responseJson.status
						if(APIresponse==200){
					        Toast.show({
					              text: 'searching driver',
					              buttonText: 'Okay',
					              duration : 3000
					            })
					      }
					})
				}
			})
			this.props.navigation.navigate('Wait')
		}
		catch(error){
			console.log(error)
		}
	}

	calculatePrice = () => {
		distance = geolib.getPathLength([
    		{latitude: this.state.pickUpLatitude, longitude: this.state.pickUpLongitude},
    		{latitude: this.state.dropOffLatitude, longitude: this.state.dropOffLongitude}
		]) / 1000
		fetch('http://10.1.3.166:5000/calculate_price', {
	      method: 'POST',
	      headers: {
	        Accept: 'application/json',
	        'Content-Type': 'application/json',
	      },
	      body:JSON.stringify({
	      Distance: distance,
	      }),
	    })
	    .then((response) => response.json())
		.then((responseJson) => {
		  let price = responseJson.final_price
		  this.setState({price:price})
		  this.state.dropOffReady ? setTimeout( () =>{this.animatedToRegion(), 2000}) : null
		})

	}

	animatedToRegion = () => {
		this.map.fitToCoordinates(
			[{ latitude: this.state.pickUpLatitude, longitude: this.state.pickUpLongitude }, { latitude: this.state.dropOffLatitude, longitude: this.state.dropOffLongitude }],
			{edgePadding: { top: height/3, right: 300, bottom: height/3*2, left: 300 }, animated: true, }
      );
	}

	getPickUpLocation = (dropOffLocation) => {
		RNGooglePlaces.lookUpPlaceByID(dropOffLocation)
    	.then((results) =>{
				this.setState({pickUpText:results.name}, () => {
					this.setState({pickUpLatitude:results.latitude})
		    		this.setState({pickUpLongitude:results.longitude}, () => {
		    			this.state.dropOffReady ? this.calculatePrice() : null
		    		})
		    		this.setState({dropOff:false})
		    		this.setState({detailShow:true})
		    		this.setState({pickUp:false})
				})
			this.state.detailShow ? this.setState({mapEdit:false}) : this.setState({mapEdit:true})
    	}).catch((error) => console.log(error.message));
	}

	getDropOffLocation = (dropOffLocation) => {
		RNGooglePlaces.lookUpPlaceByID(dropOffLocation).then((results) =>{
			setTimeout( () =>{this.animatedToRegion(), 1000})
				this.setState({dropOffText:results.name}, () => {
					this.setState({dropOffLatitude:results.latitude})
		    		this.setState({dropOffLongitude:results.longitude})
		    		this.setState({dropOffTextShow:results.name.toString()})
					this.setState({dropOffReady:true}, () =>{
						this.state.dropOffReady ? this.calculatePrice() : null
					})
					this.setState({detailShow:true})
					this.setState({dropOff:false})
		    		this.setState({pickUp:false})
		    		this.setState({mapEdit:false})
				})
		}).catch((error) => console.log(error.message));
	}

	getLocationPrediction = (autoComplete, typeText) =>{

		this.setState({type:typeText}, () =>{
			if(this.state.type.toString() === "pickup"){
				this.setState({dropOff:false})
				this.setState({detailShow:false})
				this.state.detailShow ? this.setState({mapEdit:false}) : this.setState({mapEdit:true})
				this.setState({pickUpText:autoComplete}, () =>{
					if(this.state.pickUpText.toString() === ""){
						this.setState({pickUp:false})
					}
					else{
						this.setState({pickUp:true})
						RNGooglePlaces.getAutocompletePredictions(autoComplete, {
							country: 'ID',
							latitude: this.state.pickUpLatitude,
							longitude: this.state.pickUpLongitude,
							radius:60,
						}).then((place) => {
							this.setState({
								pickUpList:[...place]
							})
						}).catch(error => console.log(error.message));
					}
				})
			}
			else if(this.state.type.toString() === "dropoff"){

				this.setState({pickUp:false})
				this.setState({detailShow:false})
				this.state.detailShow ? this.setState({mapEdit:false}) : this.setState({mapEdit:true})
				this.setState({dropOffText:autoComplete}, () =>{
					if(this.state.dropOffText.toString() === ""){
						this.setState({dropOff:false})
					}
					else{
						this.setState({dropOffReady:false})
						this.setState({dropOff:true})
						RNGooglePlaces.getAutocompletePredictions(autoComplete, {
							country: 'ID',
							latitude: this.state.pickUpLatitude,
							longitude: this.state.pickUpLongitude,
							radius:60,
						}).then((place) => {
							this.setState({
								dropOffList:[...place]
							})
						}).catch(error => console.log(error.message));
					}
				})
			}
		})
	}

	getCurrentLocation = () => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.setState({pickUpLatitude:position.coords.latitude}),
				this.setState({pickUpLongitude:position.coords.longitude})
			},
			(error) => console.log(error.message.toString()),
			{ enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
			)
	}

	getCurrentPlaceText = () => {
		RNGooglePlaces.getCurrentPlace()
	    .then((results) => {
	    	this.setState({pickUpText:results[0].address})
	    	console.log(results[0].address)
	    })
	    .catch((error) => console.log(error.message));
	}

	componentDidMount(){
		this.getCurrentLocation()
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
		var refreshPlace = this.interval = setInterval(() => {
			if(this.state.pickUpLatitude == 0){
				this.getCurrentLocation()
			}
			else{
				this.getCurrentPlaceText()
				clearInterval(refreshPlace)
			}
		}, 1000)
	}

	componentWillUnmount(){
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}

	handleBackButton() {
		this.props.navigation.navigate('Ojol');
        return true;
    }

	render(){
		return (
			<Container>
			<Header style={{backgroundColor:'black'}}>
		        <Left style={{flex:1}}>
		          <Button transparent onPress={()=>{this.props.navigation.navigate('Menu')}}>
		            <Icon name='arrow-back' />
		          </Button>
		        </Left>
		        <Body style={{flex:1}}>
		          <Title>Ride</Title>
		        </Body>
		        <Right style={{flex:1}}/>
	        </Header>
				<View style ={styles.container}>
					<MapView
						style={styles.map}
						region={{
						latitude: this.state.pickUpLatitude,
						longitude: this.state.pickUpLongitude,
						latitudeDelta: 0.015,
						longitudeDelta: 0.0121,
						}}
						ref={(ref) => { this.map = ref }}
						zoomEnabled={this.state.mapEdit}
						rotateEnabled={this.state.mapEdit}
						scrollEnabled={this.state.mapEdit}
						showsUserLocation={true}
					>
					<MapView.Marker
						coordinate={
							{latitude:this.state.pickUpLatitude, longitude:this.state.pickUpLongitude}
						} />
					{
						this.state.dropOffReady ?
						<MapView.Marker
						coordinate={
							{latitude:this.state.dropOffLatitude, longitude:this.state.dropOffLongitude}
						} />
						: null
					}
					{
						this.state.dropOffReady ?
						  <MapViewDirections
						    origin={{latitude: this.state.pickUpLatitude, longitude: this.state.pickUpLongitude}}
						    destination={{latitude: this.state.dropOffLatitude, longitude: this.state.dropOffLongitude}}
						    apikey={GOOGLE_MAPS_APIKEY}
						    strokeWidth={3}/> : null
					}
					</MapView>
					<View style={styles.searchBox}>
						<View style={styles.inputWrapper}>
				   			<Text style={styles.label}>PICK UP</Text>
				   			<InputGroup>
				   				<Input style={styles.inputSearch} placeholder="Choose pick-up location" 
				   				onChangeText={(value) => this.getLocationPrediction(value, "pickup")}
				   				value={this.state.pickUpText}/>
				   			</InputGroup>	
			   			</View>
			   			<View style={styles.secondInputWrapper}>
				   			<Text style={styles.label}>DROP OFF</Text>
				   			<InputGroup>
				   				<Input style={styles.inputSearch} placeholder="Choose drop-off location" 
				   				 onChangeText={(value) => this.getLocationPrediction(value, "dropoff")}
				   				 value={this.state.dropOffText}/>
				   			</InputGroup>	
			   			</View>

			   			{
			   				this.state.dropOff ? 
			   				<Content style={styles.listView} keyboardShouldPersistTaps='always' keyboardDismissMode='on-drag'>
				   				<List dataArray={this.state.dropOffList}
				   					renderRow={(item) =>
				   						<ListItem onPress={() => 
	                        				this.getDropOffLocation(item.placeID)
	                      				}>
				   							<Text>{item.fullText}</Text>
				   						</ListItem>
				   				}>
				   				</List>
			   				</Content>
			   				: null
			   			}

			   			{
			   				this.state.pickUp ? 
			   				<Content style={styles.listView} keyboardShouldPersistTaps='always' keyboardDismissMode='on-drag'>
				   				<List dataArray={this.state.pickUpList}
				   					renderRow={(item) =>
				   						<ListItem onPress={() => 
	                        				this.getPickUpLocation(item.placeID)
	                      				}>
				   							<Text>{item.fullText}</Text>
				   						</ListItem>
				   				}>
				   				</List>
			   				</Content>
			   				: null
			   			}
					</View>
					{
						this.state.detailShow && this.state.dropOffReady ?
						<View style={styles.detailContainer}>
				   			<Card style={styles.card}>
					   			<View style={styles.orderDetails}>
					   				<CardItem>
					   					<Body>
					   						<H1 style={styles.orderDetailsText}>{this.state.price}</H1>
					   					</Body>
					   				</CardItem>
					   				<CardItem>
					   					<Body>
					   						<Button block style={styles.buttonOrderDetails} onPress={() => this.getNearbyDriver()}>
					   							<Text>Order Now!</Text>
					   						</Button>
					   					</Body>
					   				</CardItem>
					   			</View>
				   			</Card>
				   		</View>
				   		: null
					}
					
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
 searchBox:{
 	top:20,
 	position:"absolute",
 	width:width,
 },
 inputWrapper:{
 	marginLeft:10,
 	marginRight:10,
 	marginTop:10,
 	marginBottom:0,
 	backgroundColor:"#fff",
 	opacity:0.9,
 	borderRadius:7,
 },
 secondInputWrapper:{
 	marginLeft:10,
 	marginRight:10,
 	marginTop:0,
 	marginBottom:0,
 	backgroundColor:"#fff",
 	opacity:0.9,
 	borderRadius:7,
 },
 inputSearch:{
 	fontSize:14,
 },
 label:{
 	fontSize:10,
 	fontStyle:"italic",
 	marginLeft:10,
 	marginTop:10,
 	marginBottom:0,
 },
 listView:{
 	top:5,
 	backgroundColor:"#fff",
 	marginLeft:10,
 	marginRight:10,
 	height:height/2
 },
 detailContainer:{
 	justifyContent:'flex-end',
 	flex:1,
 },
 card:{
 	height: 180,
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
 	backgroundColor:'black',
 	borderRadius:400,
 },
 orderDetailsText:{
 	alignSelf:'center'
 }
});

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

const OjolApp = connect(mapStateToProps, mapDispatchToProps)(OjolApp1);

export default withNavigation(OjolApp);