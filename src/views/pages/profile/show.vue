
<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/http';
import { useRoute, useRouter } from 'vue-router';
import { MEDIA_BASE_URL } from '@/config';

const router = useRouter();

const user = ref({
  email: '',
  first_name: '',
  last_name: '',
  profile_image: ''
});

onMounted(async () => {
  try {
    const response = await apiClient.get('/verify');
    user.value = response.data; // Assuming the API response contains the user data
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
});
const editProfile = ()=>{
    router.push('profile/edit');
}
  </script>
<template>
    <div class="card profile-card">
      <button class="edit-button" @click="editProfile">
        <i class="pi pi-pencil"></i> <!-- Using PrimeIcons for the edit icon -->
      </button>
      <div class="profile-header">
        <img v-if="user.profile_image" :src="MEDIA_BASE_URL +user.profile_image" alt="Profile Image" class="profile-img" />
        <div v-else class="profile-placeholder">No Image</div>
      </div>
      <div class="profile-details">
        <h5>{{ user.first_name }} {{ user.last_name }}</h5>
        <p>{{ user.email }}</p>
      </div>
    </div>
  </template>
  

  <style scoped>
  .profile-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    position: relative; /* Added for positioning the edit button */
  }
  
  .edit-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #333;
  }
  
  .edit-button:hover {
    color: #007bff;
  }
  
  .profile-header {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  .profile-img {
    width: 150px !important;
    height: 150px !important;
    border-radius: 50%;
  }
  
  .profile-placeholder {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    border-radius: 50%;
  }
  
  .profile-details {
    text-align: center;
    font-size: 1.5rem;
  }
  
  .profile-details h5 {
    margin: 0;
  }
  
  .profile-details p {
    margin: 0.5rem 0 0;
  }
  </style>
  

  
