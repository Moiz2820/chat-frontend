<template>
    <div class="chat-app">
        <div class="spacing custom-width">
            <div class="user-list">
                <h3 style="text-align: center;">Users</h3>
                <input type="text" v-model="searchQuery" placeholder="Search users..." class="search-input" />
                <ul>
                    <li v-for="(user, index) in filteredUsers" :key="index" @click="selectUser(user)">
                        <span class="daycare-chat-name">{{ user.name || user.email }}</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="spacing" style="width: 100%;">
            <div class="chat-room">
                <div class="chat-header">
                    <h3 style="margin: 0;">Chat Room</h3>
                    <p class="daycare-center-name" v-if="selectedUser">{{ selectedUser.name || selectedUser.email }}</p>
                </div>
                <div class="chat-messages" ref="chatMessages">
                    <div v-for="(message, index) in messages" :key="index"
                        :class="{ 'message': true, 'sent-by-me': isSentByCurrentUser(message), 'sent-by-other': !isSentByCurrentUser(message) }">
                        <span class="user mar-btm">{{ getSenderName(message) }}:</span>
                        <span class="text">{{ message.text }}</span>
                        <span class="text mx-3">{{ formatCreatedAt(message.createdAt) }}</span>
                    </div>
                </div>
                <div class="chat-input">
                    <input v-model="newMessage" @keydown.enter="sendMessage" placeholder="Type a message..." />
                    <button @click="sendMessage">Send</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db, collection, addDoc, doc, setDoc, getDocs, serverTimestamp, query, onSnapshot, orderBy, auth } from '@/config/firebaseConfig';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const messages = ref([]);
const newMessage = ref('');
const currentUser = ref(null);
const selectedUser = ref(null);
const users = ref([]);
const searchQuery = ref(''); // Search query
const chatRoomId = ref('');

// Generate a unique ID for each message
const generateMessageId = () => uuidv4();

// Fetch messages from Firestore
const fetchMessages = () => {
    if (!chatRoomId.value) return;

    const messagesRef = collection(db, 'ChatRooms', chatRoomId.value, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    onSnapshot(q, (querySnapshot) => {
        messages.value = [];
        querySnapshot.forEach((doc) => {
            messages.value.push({
                id: doc.id,
                ...doc.data()
            });
        });
        scrollToBottom();
    }, (error) => {
        console.error('Error fetching messages:', error);
    });
};

// Send a new message
const sendMessage = async () => {
    if (newMessage.value.trim() === '' || !selectedUser.value) return;

    try {
        const messageId = generateMessageId();
        const documentId = currentUser.value.uid > selectedUser.value.uid
            ? `${selectedUser.value.uid}-${currentUser.value.uid}`
            : `${currentUser.value.uid}-${selectedUser.value.uid}`;

        const messageRef = doc(collection(db, 'ChatRooms', documentId, 'messages'));
        const newMessageObj = {
            _id: messageId,
            createdAt: serverTimestamp(),
            sentBy: currentUser.value.uid,
            sentTo: selectedUser.value.uid,
            text: newMessage.value,
            user: {
                _id: currentUser.value.uid
            }
        };

        await setDoc(messageRef, newMessageObj);
        newMessage.value = '';
        scrollToBottom();
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

// Fetch users from Firestore
const fetchUsers = () => {
    const q = query(collection(db, 'users'));
    onSnapshot(q, (querySnapshot) => {
        users.value = [];
        querySnapshot.forEach((doc) => {
            users.value.push(doc.data());
        });
    }, (error) => {
        console.error('Error fetching users:', error);
    });
};

// Select a user to chat with
const selectUser = (user) => {
    selectedUser.value = user;
    chatRoomId.value = `${user.uid}-${currentUser.value.uid}`;
    fetchMessages();
};

// Scroll to the bottom of the chat messages
const scrollToBottom = () => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

// Check if a message is sent by the current user
const isSentByCurrentUser = (message) => message.sentBy === currentUser.value.uid;

// Get the name of the sender
const getSenderName = (message) => {
    if (isSentByCurrentUser(message)) {
        return currentUser.value.displayName || currentUser.value.email || 'You';
    } else if (selectedUser.value && message.sentBy === selectedUser.value.uid) {
        return selectedUser.value.name || 'Unknown Sender';
    } else {
        return 'Unknown Sender';
    }
};

// Format the creation time of a message
const formatCreatedAt = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return '';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'Pp');
};

// Compute filtered users based on the search query
const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user =>
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
    );
});

onMounted(() => {
    fetchUsers();
    onAuthStateChanged(getAuth(), async (user) => {
        if (user) {
            currentUser.value = user;
            try {
                const daycareDoc = await getDocs(doc(db, 'daycare', user.uid));
                if (daycareDoc.exists()) {
                    currentUser.value = daycareDoc.data();
                }
            } catch (error) {
                console.error('Error fetching logged-in daycare name:', error);
            }
        }
    });
});
</script>




<style scoped>
.spacing {
    margin: 0 5px;
}

.custom-width {
    width: 20%;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.02), 0px 0px 2px rgba(0, 0, 0, 0.05), 0px 1px 4px rgba(0, 0, 0, 0.08);
}

.chat-app {
    display: flex;
}

.daycare-center-name {
    font-size: 16px;
    font-weight: 500;
    color: black;
}

.user-list {
    width: 100%;
    padding: 15px 10px;
    height: calc(100vh - 10rem);
    overflow: auto;
}

.user-list ul {
    list-style: none;
    padding: 0;
    flex-grow: 1;
    overflow-y: auto;
}

.user-list li {
    cursor: pointer;
    padding: 8px 5px;
    background: #f1f1f1;
    margin-bottom: 10px;
    text-align: center;
    border-radius: 5px;
    text-transform: capitalize;
}

.user-list li:hover {
    background-color: #f7eb9b;
}

.chat-room {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 10rem);
    margin: 0 auto;
    border-radius: 12px;
    background-color: #fff;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.02), 0px 0px 2px rgba(0, 0, 0, 0.05), 0px 1px 4px rgba(0, 0, 0, 0.08);
}

.chat-header {
    padding: 15px;
    background-color: #5eddee;
    color: white;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    background-color: #fff;
}

.message {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 5px;
    background-color: #f1f1f1;
}

.sent-by-me {
    text-align: right;
    background-color: #f1f1f1;
    padding: 10px;
    border-radius: 4px;
    width: fit-content;
    margin-left: auto;
    font-size: 13px;
}

.sent-by-other {
    text-align: left;
    background: #f7f7f7;
    width: fit-content;
    margin-right: auto;
    font-size: 13px;
}

.user {
    font-weight: bold;
    margin-right: 5px;
}

.chat-input {
    display: flex;
    padding: 15px;
    background-color: #f5f5f5;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

.chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.chat-input button {
    margin-left: 10px;
    padding: 10px;
    background-color: #5eddee;
    border: none;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

.chat-input button:hover {
    background-color: #46b6c8;
}



.search-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.user-list {
    width: 100%;
    padding: 15px 10px;
    height: calc(100vh - 10rem);
    overflow: auto;
}

.user-list ul {
    list-style: none;
    padding: 0;
    flex-grow: 1;
    overflow-y: auto;
}

.user-list li {
    cursor: pointer;
    padding: 8px 5px;
    background: #f1f1f1;
    margin-bottom: 10px;
    text-align: center;
    border-radius: 5px;
    text-transform: capitalize;
}

.user-list li:hover {
    background-color: #f7eb9b;
}
</style>