import React, { Component } from 'react';
import { Platform,StyleSheet,BackHandler, Image, View,
          TouchableHighlight, AsyncStorage, Dimensions} from 'react-native';
import { withNavigation } from 'react-navigation';
import { Container, Header, Content, Footer, 
         FooterTab, Button, Text, InputGroup, Input, List, ListItem,
     	 Card, CardItem, Body, H1, Icon, Left, Right, Title} from 'native-base';

var width = Dimensions.get("window").width
var height = Dimensions.get("window").height

class Drawer1 extends React.Component {
	async removeItemValue(key) {
		try {
			await AsyncStorage.removeItem(key);
			this.props.navigation.navigate('Home')
		}
		catch(exception) {
			console.log(exception)
		}
	}

	render(){
		return (
			<Container style={{backgroundColor:'#FFFFFF'}}>
					<View style={{height:100}}></View>
					<Button style={styles.buttonLogout} onPress={() => this.removeItemValue('user')}><Text>Logout</Text></Button>
				
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	buttonLogout:{
		backgroundColor:'#123456',
		alignSelf:'center',
		justifyContent:'center',
	},
})

export default withNavigation(Drawer1);