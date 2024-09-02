<script>
import { ref, onMounted } from 'vue';
import { db, auth } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, onSnapshot, where, setDoc, getDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import apiClient from '@/http';

export default {
  setup() {
    const messages = ref([]);
    const users = ref([]);
    const isSelected = ref(false);
    const selectedUser = ref(null);
    const authUser = ref(null);
    const newMessage = ref('');
    const chatroomId = ref('');
    const chatroomDocRef = ref(null);
    var msg = ref(null);

      var moiz = "molal";
      var bilal = "mzlal";

      var name = moiz > bilal ? moiz : bilal;
      console.log('the return name is : '+name);

    // Real-time subscription to messages
    onMounted(() => {
      getAuth();
      fetchUsers();
      // const unsubscribe = getMessagesWithChatIdCondition();

    });

    async function getMessagesWithChatIdCondition() {
      try {
        const auth = authUser.value.id;
        const unsubscribeFunctions = [];

        users.value.forEach((user) => {
          const documentId = auth < user.id
            ? `${auth}_${user.id}`
            : `${user.id}_${auth}`;

          const messageRef = query(
            collection(db, "messages", documentId, "messages"),
            orderBy("createdAt", "desc"),
            limit(1)
          );

          // Listen for real-time updates in the message collection
          const unsubscribe = onSnapshot(messageRef, (querySnapshot) => {
            let lastMessage = null;

            querySnapshot.forEach((doc) => {
              lastMessage = doc.data();
            });

            user.lastMessage = lastMessage;

            // After receiving a new message, sort the users again
            sortUsersByLastMessage();
          });

          // Store the unsubscribe function to later stop listening if needed
          unsubscribeFunctions.push(unsubscribe);
        });

        return unsubscribeFunctions;
      } catch (error) {
        console.error("Error setting up real-time listener: ", error);
      }
    }

    const sortUsersByLastMessage = () => {
      users.value.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt?.toDate() || 0;
        const dateB = b.lastMessage?.createdAt?.toDate() || 0;
        return dateB - dateA;
      });

      // console.log('Sorted Users:', users.value); // Log the sorted users
    };


    // function sortUsersBasedOnMessage(messageData) {
    //   console.log('changing')
    //   const senderId = messageData.sender;
    //   const receiverId = messageData.receiver;
    //   const currentUserId = authUser.value.id;

    //   let userToMove = null;

    //   if (senderId !== currentUserId) {
    //     userToMove = users.value.find(user => user.id === senderId);
    //   } else if (receiverId !== currentUserId) {
    //     userToMove = users.value.find(user => user.id === receiverId);
    //   }

    //   if (userToMove) {
    //     console.log(userToMove.first_name, messageData.text)
    //     userToMove.lastMessage = messageData;
    //     // Move the user to the top of the list
    //     users.value = users.value.filter(user => user.id !== userToMove.id);
    //     users.value.unshift(userToMove);
    //   }
    // }



    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users');
        users.value = response.data;
        getMessagesWithChatIdCondition();
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const getAuth = async () => {
      const response = await apiClient.get('/verify');
      authUser.value = response.data;
      // console.log('currentuser: ' + authUser.value.id);

    };

    const lastMessages = ref({}); // Store the last messages for each user

    // const fetchLastMessage = async (user) => {
    //   try {
    //     const chatId = authUser.value.id < user.id
    //       ? `${authUser.value.id}_${user.id}`
    //       : `${user.id}_${authUser.value.id}`;

    //     const messagesCollectionRef = collection(db, 'messages', chatId, 'messages');
    //     const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), limit(1));

    //     const querySnapshot = await getDocs(q);
    //     const lastMsg = querySnapshot.docs.map(doc => doc.data());
    //     const msg = lastMsg.length > 0 ? lastMsg[0].text : "Start conversation";

    //     lastMessages.value[user.id] = lastMsg; // Store the last message for the user
    //     // console.log(lastMessages.value[user.id])
    //   } catch (error) {
    //     console.error('Error fetching last message:', error);
    //     lastMessages.value[user.id] = "Error loading message"; // Handle error case
    //   }
    // };

    // const fetchAllLastMessages = () => {
    //   users.value.forEach(user => {
    //     fetchLastMessage(user);
    //   });
    // };

    const selectUser = async (user) => {
      selectedUser.value = user;
      isSelected.value = true;

      // Create chatroom ID by concatenating the user IDs
      chatroomId.value = authUser.value.id < user.id
        ? `${authUser.value.id}_${user.id}`
        : `${user.id}_${authUser.value.id}`;

      // Check if the chatroom exists
      chatroomDocRef.value = doc(db, 'messages', chatroomId.value);
      const chatroomDocSnap = await getDoc(chatroomDocRef.value);

      if (!chatroomDocSnap.exists()) {
        // If the chatroom does not exist, create it with an empty messages array
        await setDoc(chatroomDocRef.value, { messages: [] });
      }
      // if (!user.id || !chatroomId.value) {
      //   console.error('User ID or Chatroom ID is undefined');
      //   return;
      // }

      // try {
      const lastMessageQuery = query(
        collection(db, 'messages', chatroomId.value, 'messages'),
        where('sender', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(lastMessageQuery);
      console.log(querySnapshot);
      if (!querySnapshot.empty) {
        // There should be only one document in the querySnapshot since we used limit(1)
        const lastMessageDoc = querySnapshot.docs[0];
        const messageRef = doc(db, 'messages', chatroomId.value, 'messages', lastMessageDoc.id);

        // Update the 'seen' field to true for the last message
        await updateDoc(messageRef, { seen: '1' });

        console.log('Last message from authUser has been marked as seen.');
      } else {
        console.log('No messages found for this user.');
      }



      // Subscribe to the messages in the chatroom
      const messagesQuery = query(collection(chatroomDocRef.value, 'messages'), orderBy('createdAt'));
      onSnapshot(messagesQuery, (snapshot) => {
        messages.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    };

    const sendMessage = async () => {
      if (newMessage.value.trim()) {
        try {
          const chatMessagesCollection = collection(chatroomDocRef.value, 'messages');
          await setDoc(doc(chatMessagesCollection), {
            text: newMessage.value,
            sender: authUser.value.id,
            receiver: selectedUser.value.id,
            user: authUser.value.first_name,
            seen: 0,
            createdAt: serverTimestamp()
          });
          newMessage.value = '';
        } catch (error) {
          console.error('Error adding message: ', error);
        }
      }
    };

    return { messages, newMessage, auth, users, isSelected, selectedUser, authUser, selectUser, sendMessage, lastMessages };
  }
};
</script>

<template>
  <div class="chat-container">
    <!-- User List -->
    <section class="user-container">
      <ul>
        <li v-for="user in users" :key="user.id" class="user-item">
          <button @click="selectUser(user)" class="chat-button">
            <div class="chat-info">
              <h4 class="chat-name">{{ user.first_name }}</h4>
              <div v-if="user.lastMessage?.sender == user.id">
                <p :class="{ 'seen': user.lastMessage.seen == '0' }" class="chat-message">
                  {{ user.first_name }}:
                  {{ user.lastMessage.text }}</p>
              </div>
              <div v-else-if="user.lastMessage?.sender == authUser.id">
                <p class="chat-message">You: {{ user.lastMessage.text }}</p>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </section>

    <!-- Chat Box -->
    <div v-if="isSelected" class="chat-room">
      <div
        style="text-align: center; font-size: 20px; font-weight: 600; padding-top:10px; padding-bottom:10px;border-radius: 20px; border-bottom:1px solid grey">
        {{ selectedUser.first_name }}
      </div>
      <section class="messages-container">
        <ul class="messages-list">
          <li v-for="message in messages" :key="message.id"
            :class="{ 'my-message': message.sender === authUser.id, 'other-message': message.sender !== authUser.id }"
            class="message">
            <div class="message-wrap">
              <div class="message-wrap-content">
                <p>
                  {{ message.text }}
                </p>
                <!-- <small class="time">{{ message.createdAt?.toDate().toLocaleTimeString() }}</small> -->
              </div>
            </div>
            <!-- <div class="conversation-name">
              {{ message.user }}
            </div> -->
          </li>
        </ul>
      </section>
      <form class="message-form" @submit.prevent="sendMessage">
        <input v-model="newMessage" type="text" placeholder="Type your message here..." class="message-input" />
        <button type="submit" class="send-button">Send</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Layout and Container */
.chat-container {
  display: flex;
  height: 70vh;
  width: 100%;
}

.seen {
  font-weight: 800 !important;
}

.user-container {
  width: 20%;
  background-color: #fff;
  padding: 10px;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.user-item {
  margin-bottom: 10px;
}

.chat-button {
  width: 100%;
  padding: 15px;
  text-align: left;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s;
}

.chat-button:hover {
  background-color: #f8f8f8;
}

.chat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #000;
}

.chat-message {
  font-size: 14px;
  margin: 0;
  color: #888;
}

.chat-room {
  width: 75%;
  /* Ensure chat-room takes the remaining space */
  display: flex;
  flex-direction: column;
  background-color: white;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.messages-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Message Styles */
.message {
  margin-bottom: 24px;
  position: relative;
  clear: both;
  max-width: 70%;
}

.message.my-message {
  float: right;
  text-align: right;
}

.message.other-message {
  float: left;
  text-align: left;
}

.message-wrap {
  display: inline-block;
  margin-bottom: 10px;
  line-height: 1.4;
}

.message-wrap-content {
  background-color: #0084ff;
  /* Messenger blue for other users' messages */
  border-radius: 18px 18px 18px 0;
  color: white;
  padding: 12px 20px;
}

.my-message .message-wrap-content {
  background-color: #e4e6eb;
  /* Light gray background for own messages */
  color: #050505;
  border-radius: 18px 18px 0 18px;
}

.time {
  color: rgba(255, 255, 255, 0.75);
  /* Light white time text */
  font-size: 12px;

}

.my-message .time {
  color: rgba(0, 0, 0, 0.5);
  /* Light black time text */
}

/* Input Form */
.message-form {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #ccc;
  display: flex;
  align-items: center;
  /* Subtract the padding of the chat-room */
  box-sizing: border-box;
  /* Include padding and border in width calculation */
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 15px;
}

.send-button {
  padding: 10px 20px;
  background: #0084ff;
  /* Messenger blue */
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.send-button:hover {
  background: #b9d2e1;
  /* Darker blue on hover */
}

.user-container ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.user-container ul li {
  margin-bottom: 10px;
}

.user-container ul li button {
  background: #e2e5e9;
  color: white;
  padding: 10px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.3s;
}

.user-container ul li button:hover {
  background: #006db3;
}

form {
  width: 100% !important;
  max-width: 100%;
}
</style>
