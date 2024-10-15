<template>
  <div class="chat-container">
    <div class="chat-app">
      <!-- Left: Chat List -->
      <div class="chat-list">
        <div v-for="chat in chatList" :key="chat.id" @click="selectChat(chat)" class="chat-item" :class="{ 'selected': selectedChat && selectedChat.id === chat.id }">
          <img :src="chat.avatar" alt="Avatar" class="avatar" />
          <div class="chat-info">
            <h5>{{ chat.name }}</h5>
            <p class="course-title">{{ chat.title }}</p> <!-- Display the course title -->
            <p class="last-message">{{ chat.lastMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Right: Chat Messages -->
      <div class="chat-window">
        <div v-if="selectedChat" class="chat-header">
          <h4>{{ selectedChat.name }}</h4>
        </div>
        <div class="chat-messages">
          <div v-for="message in messages" :key="message.id" class="message" :class="{ 'from-me': message.sender === currentUser.name }">
            <img :src="message.senderAvatar" alt="Avatar" class="avatar" />
            <div class="message-content">
              <p>{{ message.text }}</p>
              <span class="timestamp">{{ formatTimestamp(message.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." class="form-control" />
          <button @click="sendMessage" class="btn btn-primary">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import ChatEngine from 'chat-engine';  // Assuming ChatEngine setup is already configured

export default {
  data() {
    return {
      chatList: [],          // List of all chats
      selectedChat: null,    // The currently selected chat
      messages: [],          // Messages for the selected chat
      newMessage: '',        // New message input
      currentUser: {
        name: 'You',         // Your user details (can fetch dynamically)
        avatar: 'src/assets/user.jpg'
      }
    };
  },
  mounted() {
    this.loadChats();
  },
  methods: {
  async loadChats() {
    // Replace with ChatEngine's method to load chats for the current user
    this.chatList = [
      {
        id: 'chat1',
        name: 'Matilda Leow',
        avatar: 'src/assets/instructor.jpg',
        title: 'Sourdough Bread Baking Class',
        lastMessage: 'I am good, thanks!'
      },
      {
        id: 'chat2',
        name: 'Sabrina Carpenter',
        avatar: 'src/assets/instructor2.jpg',
        title: 'Music Production 101',
        lastMessage: 'Yes! Feel free to drop by if you can.'
      }
    ];
  },
  selectChat(chat) {
    this.selectedChat = chat;
    this.loadMessages(chat.id);
  },
  loadMessages(chatId) {
    // Check if the selected chat is Sabrina Carpenter's chat
    if (chatId === 'chat2') {
      this.messages = [
        {
          id: 1,
          sender: 'You',
          senderAvatar: 'src/assets/user.jpg',
          text: 'Hi, are there still slots available for the Saturday 1PM class?',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          sender: 'Sabrina Carpenter',
          senderAvatar: 'src/assets/instructor2.jpg',
          text: 'Yes! Feel free to drop by if you can.',
          createdAt: new Date().toISOString()
        }
      ];
    } else {
      // Placeholder for other chat messages (e.g., Matilda Leow's chat)
      this.messages = [
        {
          id: 1,
          sender: 'Sabrina Carpenter',
          senderAvatar: 'src/assets/instructor2.jpg',
          text: 'Hello, how are you?',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          sender: 'You',
          senderAvatar: 'src/assets/user.jpg',
          text: 'I am good, thanks!',
          createdAt: new Date().toISOString()
        }
      ];
    }
  },
  sendMessage() {
    if (this.newMessage.trim() !== '') {
      // Add message to UI
      this.messages.push({
        id: this.messages.length + 1,
        sender: this.currentUser.name,
        senderAvatar: this.currentUser.avatar,
        text: this.newMessage,
        createdAt: new Date().toISOString()
      });

      // Clear input field
      this.newMessage = '';

      // Send message using ChatEngine (this will be replaced with actual ChatEngine sending logic)
      ChatEngine.sendMessage(this.selectedChat.id, this.newMessage);
    }
  },
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
};
</script>

<style scoped>
/* Chat container to restrict to 70% of screen width */
.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: white;
}

/* Chat app styles */
.chat-app {
  display: flex;
  width: 70%;  /* 70% of the screen width */
  height: 80vh; /* Set height to 80% of the screen height */
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* Chat list styles */
.chat-list {
  width: 30%;
  background-color: #f8f9fa;
  overflow-y: auto;
  border-right: 1px solid #ddd;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-item:hover,
.chat-item.selected {
  background-color: #e9ecef;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.chat-info {
  display: flex;
  flex-direction: column;
}

.last-message {
  font-size: 0.9em;
  color: #6c757d;
}

/* Chat window styles */
.chat-window {
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
}

.chat-messages {
  padding: 15px;
  overflow-y: auto;
  background-color: #f1f1f1;
  flex: 1;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.message.from-me {
  justify-content: flex-end;
}

.message-content {
  background-color: #e1f0ff;
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
}

.timestamp {
  font-size: 0.8em;
  color: #888;
}

.chat-input {
  display: flex;
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.chat-input input {
  width: 100%;
  margin-right: 10px;
}

.chat-input button {
  width: 100px;
}

.course-title {
  font-size: 0.8em;
  color: #888;
  margin-top: 2px;
  font-style: italic;
}
</style>
