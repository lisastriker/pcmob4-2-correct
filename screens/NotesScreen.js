import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../database/firebaseDB";
export default function NotesScreen({ navigation, route }) {
  const [notes, setNotes] = useState([]);
  const db = firebase.firestore().collection("todos")
  //Load up firebase database on start
  //Snapshot keeps everything synced -- no need to do it again
  useEffect(()=>{
    const unsubscribe = db //snapshot has a listener, a function that runs everytime collection change so it will run the collection function
    .onSnapshot((collection)=>{ //snapshot function takes an observer. Its async as default so it will wait
      const updatedNotes = collection.docs.map((doc)=> doc.data());
      //Map is a built in firebase/javascript function goes through every item, 
      //document is a json wrapped up. Each doc object has lots of stuff
      //doc.data extracts json from the document
      setNotes(updatedNotes)
      console.log(updatedNotes)
    });
    return()=>{
      unsubscribe(); //Just stop code from running in background at end
    }
  },[])

  // This is to set up the top right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addNote}>
          <Ionicons
            name="ios-create-outline"
            size={30}
            color="black"
            style={{
              color: "#f55",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      ),
    });
  });

  // Monitor route.params for changes and add items to the database
  useEffect(() => {
    if (route.params?.text) {
      const newNote = {
        title: route.params.text,
        done: false,
        id: notes.length.toString(),
      };
      firebase.firestore().collection("todos").add({
        newNote, //Because this creates an item newNote with the properties
      });
      console.log(newNote)
    }
  }, [route.params?.text]);

  function addNote() {
    navigation.navigate("Add Screen");
  }

  // This deletes an individual note
  function deleteNote(id) {
    firebase
    .firestore()
    .collection("todos").onSnapshot((snapshot)=>{
      //doc.id = document unique string. doc.data().newNote.id is given like 0 or 1
      snapshot.docs.forEach(doc=>{
        if(id==doc.data().newNote.id){
          firebase.firestore().collection("todos").doc(doc.id).delete()
        }else{
          console.log(id)
        }
      })
    });

    // To delete that item, we filter out the item we don't wan
    //if you want delete no 5, it filters for everything else n presents it
    //setNotes(notes.filter((item) => item.id !== id));
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) { //Therefor we must take item.newNote
    return (
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text>{item.newNote.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.newNote.id)}>
          <Ionicons name="trash" size={16} color="#944" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
        keyExtractor={(item) => item.newNote.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
});
