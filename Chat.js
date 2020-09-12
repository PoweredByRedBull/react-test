import React, { useState, useEffect } from 'react';
import { Avatar, IconButton } from "@material-ui/core"
import { AttachFile, MoreVert, SearchOutlined } from "@material-ui/icons";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import { useParams } from "react-router-dom";
// for time different zones
import firebase from "firebase";

// Local imports.
import "./Chat.css";
import db from "./firebase"
import { useStateProviderValue } from "./StateProvider"

function Chat() {
    // db constant
    const [input, setInput] = useState("");
    // value / modifeValue
    const [seed, setSeed] = useState("");
    // hook for url(used in app.js /rooms/:roomId
    const { roomId } = useParams();
    // keeping track of the room
    const [roomName, setRoomName] = useState("");
    // messages constant
    const [messages, setMessages] = useState([]);
    // db user
    const [{ user }, dispatch] = useStateProviderValue();

   
    useEffect (() => {
        if (roomId) {
            // rooms
            db.collection("rooms")
                .doc(roomId)
                .onSnapshot((snapshot) =>
                    setRoomName(snapshot.data().name));

            // messages. asc = ascending.
            db.collection("rooms")
                .doc(roomId)
                .collection("messages")
                .orderBy("timestamp", "asc")
                .onSnapshot((snapshot) => 
                    setMessages(snapshot.docs.map((doc) => doc.data()))
            );
        }
    }, [roomId])

    // hook inside of react
    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, [roomId]);

    const sendMessage = (e) => {
        e.preventDefault();
        console.log("You typed >>>", input);

        db.collection("rooms").doc(roomId).collection("messages").add({
            message: input,
            // coming from Google auth
            name: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        // Whenever user hits Enter. Clean the input.
        setInput("");
    };

    return (
        <div className="chat">
            <div className="chat_header">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`}/>
                <div className="chat_headerInfo">
                    <h3>{roomName}</h3>
                    <p>
                        Last seen at {" "}
                        {new Date(messages[messages.length - 1]?.timestamp?.toDate()
                        ).toUTCString()}
                    </p>
                </div>
                <div className="chat_headerRight">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>


            <div className="chat_body">
                {messages.map((message) => (
                    // {/* if condition is true, activate chat_receiver css option */}
                    // compares Google name and sets message (received / sent ) chat. use ID(!) in production
                    <p className={`chat_message ${message.name === user.displayName && "chat_receiver"}`} >
                        <span className="chat_name" >
                            {message.name}</span>
                            {message.message}
                        <span className="chat_timestamp">
                            {new Date(message.timestamp?.toDate()).toUTCString()}
                        </span>
                    </p>
                ))}
            </div>
            <div className="chat_footer">
                <InsertEmoticonIcon />
                <form>
                    {/* value={input} storing the text in our const, which is storing it into db */}
                    {/* onChanee={(e) => setInput (e.target.value)} === stores text into memory */}
                    <input
                        value={input}
                        onChange={(e) => setInput (e.target.value)}
                        placeholder="Type a message"
                        type="text">
                    </input>
                    <button
                        onClick={sendMessage}
                        type="submit">
                        Send a message
                    </button>
                </form>
                <MicIcon />
            </div>
        </div>
    )
}

export default Chat
