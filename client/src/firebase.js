import firebase from "firebase/app"
import "firebase/auth"

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAfHJDtCre79gCV36HroQlzqFVGE40u3Pk",
  authDomain: "gqlreactnode-3b49a.firebaseapp.com",
  projectId: "gqlreactnode-3b49a",
  storageBucket: "gqlreactnode-3b49a.appspot.com",
  //messagingSenderId: "433714627379",
  appId: "1:433714627379:web:3a2da6b2c24a132605f446",
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}


export const auth = firebase.auth() 
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()