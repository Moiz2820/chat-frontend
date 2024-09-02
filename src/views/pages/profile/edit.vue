<script setup>
import { ref, onMounted } from 'vue';
import UserService from '@/service/UserService';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/http';
import { MEDIA_BASE_URL } from '@/config';

const route = useRoute();
const router = useRouter();
const userId = route.params.id;

const user = ref({});
const firstName = ref('');
const lastName = ref('');
const errors = ref([]);
const profile_img = ref('');


const handleFileUpload = (event) => {
  profile_img.value = event.target.files[0];
};

onMounted(async () => {
  try {
    const response = await apiClient.get('/verify');
    user.value = response.data;
    firstName.value = user.value.first_name;
    lastName.value = user.value.last_name;
    profile_img.value = user.value.profile_image;

    
  } catch (error) {
    console.error('Error fetching user:', error);
  }
});



const updateUser = async () => {
  try {
    const formData = new FormData()
    formData.append('first_name', firstName.value);
    formData.append('last_name', lastName.value);
    if (profile_img.value) {
      formData.append('profile_image', profile_img.value);
    }
    

    const response = await apiClient.post('/update_profile', formData);
    router.push('/profile');
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error logging in:', error);
    }
  }
};
</script>

<template>
  <div class="card">
    <h5>Edit Profile</h5>
    <div class="card p-fluid form-card">
      <form @submit.prevent="updateUser">
        <div class="form-header">
          <img v-if="profile_img" :src="MEDIA_BASE_URL + profile_img" alt="Profile Image" class="profile-image">
          <div v-else class="profile-placeholder">No Image</div>
        </div>
        <div class="field">
          <label for="first_name">First Name</label>
          <InputText id="first_name" v-model.trim="firstName" type="text"
            :class="{ 'p-invalid': errors.first_name && errors.first_name[0] }" />
          <small v-if="errors.first_name" class="p-error font-medium">{{ errors.first_name[0] }}</small>


        </div>
        <div class="field">
          <label for="last_name">Last Name</label>
          <InputText id="last_name" v-model.trim="lastName" type="text"
            :class="{ 'p-invalid': errors.last_name && errors.last_name[0] }" />
            <small v-if="errors.last_name" class="p-error font-medium">{{ errors.last_name[0] }}</small>

        </div>
        <div class="field">
            <label for="image">Upload Profile Image</label>
            <input id="image" type="file" @change="handleFileUpload" accept="image/*" :class="{ 'p-invalid': errors.profile_image && errors.profile_image[0] }" />
            <small v-if="errors.profile_image" class="p-error font-medium">{{ errors.profile_image[0] }}</small>
          </div>
        <ButtonGroup>
          <RouterLink :to="{ name: 'profile' }">
            <Button label="Cancel" severity="danger" />
          </RouterLink>
          <Button label="Update" type="submit"  />
         

        </ButtonGroup>
      </form>
    </div>
  </div>
</template>
