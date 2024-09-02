<template>
    <div class="chat-container">
      <div class="messages-list" ref="messagesList">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="{'my-message': message.senderId === userId, 'their-message': message.senderId !== userId}"
        >
          <p>{{ message.text }}</p>
        </div>
      </div>
      <div class="input-container">
        <input v-model="messageText" placeholder="Type a message..." @keyup.enter="sendMessage" />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </template>
  
  <script>
  import { db, auth } from '@/firebase';
  
  export default {
    data() {
      return {
        messages: [],
        messageText: '',
        chatId: this.$route.params.chatId,
        userId: auth.currentUser.uid,
      };
    },
    created() {
      this.fetchMessages();
    },
    methods: {
      fetchMessages() {
        db.collection('chats')
          .doc(this.chatId)
          .collection('messages')
          .orderBy('timestamp', 'asc')
          .onSnapshot(snapshot => {
            this.messages = snapshot.docs.map(doc => doc.data());
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          });
      },
      sendMessage() {
        if (this.messageText.trim()) {
          const newMessage = {
            senderId: this.userId,
            text: this.messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
          };
          db.collection('chats')
            .doc(this.chatId)
            .collection('messages')
            .add(newMessage);
          this.messageText = '';
        }
      },
      scrollToBottom() {
        const container = this.$refs.messagesList;
        container.scrollTop = container.scrollHeight;
      },
    },
  };
  </script>
  
  <style scoped>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .messages-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
  }
  .my-message {
    align-self: flex-end;
    background-color: #dcf8c6;
    padding: 10px;
    margin: 5px;
    border-radius: 10px;
    max-width: 80%;
  }
  .their-message {
    align-self: flex-start;
    background-color: #fff;
    padding: 10px;
    margin: 5px;
    border-radius: 10px;
    max-width: 80%;
  }
  .input-container {
    display: flex;
    padding: 10px;
    background-color: #fff;
    border-top: 1px solid #ececec;
  }
  input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 20px;
    border: 1px solid #ececec;
    outline: none;
  }
  button {
    margin-left: 10px;
    padding: 10px;
    background-color: #075e54;
    color: white;
    border: none;
    border-radius: 20px;
  }
  </style>