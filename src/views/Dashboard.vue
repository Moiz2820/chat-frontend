<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import apiClient from '@/http';
import io from 'socket.io-client';
import Pusher from 'pusher-js';


const users = ref([]);
const selectedUser = ref(null);
const messages = ref([]);
const newMessage = ref('');
const authUser = ref(''); // Replace with the actual authenticated user ID
let socket; 

let pusher; 
let channel;

const fetchUsers = async () => {
    try {
        const response = await apiClient.get('/users');
        users.value = response.data.users;
    } catch (error) {
        console.log("Unable to fetch users: " + error);
    }
};

const getAuthUser = async () => {
    try {
        const response = await apiClient.get('/verify');
        authUser.value = response.data.id; // Assuming the API response contains the user data
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};

const fetchMessages = async (userId) => {
    try {
        const response = await apiClient.get(`/messages/${userId}`);
        messages.value = response.data;
    } catch (error) {
        console.log("Unable to fetch messages: " + error);
    }
};

const selectUser = (user) => {
    selectedUser.value = user;
    fetchMessages(user.id);
    setupWebSocket(); // Setup WebSocket when a user is selected
};

const setupWebSocket = () => {

    const token = localStorage.getItem('authToken');

    if (pusher) {
        pusher.disconnect();
    }
  console.log(token);
    pusher = new Pusher('abcdef', { // Replace with your Pusher key
        cluster: 'm1', // Replace with your Pusher cluster
        wsHost: 'virtualrealitycreators.com/websocket',
        wsPort: 6001, // Replace with your WebSocket server port
        wssPort: 6001, // Use for secure WebSocket (if applicable)
        forceTLS: true, // Set to true if using HTTPS
        enabledTransports: ['ws','wss'],
        disableStats: true,
        authEndpoint: 'https://virtualrealitycreators.com/websocket/api/broadcasting/auth', // Your Laravel broadcasting auth endpoint
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });

    channel = pusher.subscribe(`private-chat.${authUser.value}.${selectedUser.value.id}`);
    channel = pusher.subscribe(`private-chat.${selectedUser.value.id}.${authUser.value}`);
    channel.bind('App\\Events\\MessageEvent', (data) => {
        console.log('New message received:', data);
        messages.value.push(data.message);
    });

    pusher.connection.bind('connected', () => {
        console.log('Connected to Pusher');
    });

    pusher.connection.bind('error', (error) => {
        console.error('Pusher connection error:', error);
    });
};




const sendMessage = async () => {
    if (newMessage.value.trim() === '') return;

    const formData = new FormData();
    formData.append('receiver_id', selectedUser.value.id);
    formData.append('message', newMessage.value);

    try {
        const response = await apiClient.post('/sendmessage', formData);    
        messages.value.push(response.data); // Add the sent message to the list
        newMessage.value = '';
    } catch (error) {
        console.log("Unable to send message: " + error);
    }
};

onMounted(() => {
    fetchUsers();
    getAuthUser();
    
});
watch(selectedUser, (newUser) => {
    if (newUser) {
        setupWebSocket();
    }
});

onBeforeUnmount(() => {
    if (pusher) {
        pusher.disconnect(); // Clean up the WebSocket connection
    }
});
</script>

<template>
    <div class="chat-container">
        <div class="user-list">
            <ul>
                <li v-for="user in users" :key="user.id" @click="selectUser(user)">
                    {{ user.name }}
                </li>
            </ul>
        </div>
        <div class="chat-box" v-if="selectedUser">
            <h3>Chat with {{ selectedUser.name }} </h3>
            <div class="messages">
                <div
                    v-for="message in messages"
                    :key="message.id"
                    :class="{                        
                        'message-right': message.sender_id === authUser,
                        'message-left': message.sender_id !== authUser
                    }"
                >
                    {{ message.message }}
                </div>
            </div>
            <div class="message-input">
                <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..." />
                <button @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.chat-container {
    display: flex;
}

.user-list {
    width: 30%;
    border-right: 1px solid #ccc;
    padding: 10px;
}

.chat-box {
    width: 70%;
    padding: 10px;
}

.messages {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 10px;
}

.message-left {
    text-align: left;
    margin: 5px 0;
    padding: 8px;
    background-color: #f1f1f1;
    border-radius: 5px;
}

.message-right {
    text-align: right;
    margin: 5px 0;
    padding: 8px;
    background-color: #d1ffd6;
    border-radius: 5px;
}

.message-input {
    display: flex;
}

.message-input input {
    flex: 1;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.message-input button {
    margin-left: 10px;
    padding: 8px 16px;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}
</style>
