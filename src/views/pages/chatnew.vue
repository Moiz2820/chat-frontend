<template>
    <div class="chats-container">
        <div v-for="chat in chats" :key="chat.id" class="chat-item" @click="openChat(chat.id)">
            <div class="chat-details">
                <h3>{{ chat.participantNames.join(', ') }}</h3>
                <p>{{ chat.lastMessage.text }}</p>
            </div>
            <div v-if="!chat.lastMessage.readBy.includes(userId)" class="unread-indicator"></div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db, auth } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default {
    setup() {
        const chats = ref([]);
        const userId = ref(auth.currentUser.uid);
        console.log(auth.currentUser.uid);


        const fetchChats = () => {
            const chatsCollection = collection(db, 'chats');
            const chatsQuery = query(
                chatsCollection,
                where('participants', 'array-contains', userId.value),
                orderBy('lastMessage.timestamp', 'desc')
            );

            onSnapshot(chatsQuery, (snapshot) => {
                chats.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            });
        };

        const openChat = (chatId) => {
            // Assuming Vue Router is being used
            // You can access router with this.$router.push in Options API,
            // but in Composition API, use `useRouter` from 'vue-router'
            const router = useRouter();
            router.push(`/chat/${chatId}`);
        };

        onMounted(() => {
            fetchChats();
        });

        return {
            chats,
            userId,
            openChat,
        };
    },
};
</script>


<style scoped>
.chats-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.chat-item {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ececec;
    cursor: pointer;
}

.chat-details {
    flex-grow: 1;
}

.unread-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ff3b3b;
}
</style>