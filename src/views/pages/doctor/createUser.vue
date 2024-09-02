<script setup>
import { ref } from 'vue';
import UserService from '@/service/UserService';
import { useRouter } from 'vue-router';
import apiClient from '@/http';

const router = useRouter();

const user = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  profile_image: null, // Changed to null to hold the file object
  status: null,
});
const errors = ref([]);
const status = ref(null);
const statusValues = ref([
  { name: 'Active', value: 'Active' },
  { name: 'Inactive', value: 'Inactive' },
]);

const handleFileUpload = (event) => {
  user.value.profile_image = event.target.files[0];
};

const addUser = async () => {
  try {
    user.value.status = status.value?.value;

    const formData = new FormData();
    formData.append('first_name', user.value.first_name);
    formData.append('last_name', user.value.last_name);
    formData.append('email', user.value.email);
    formData.append('password', user.value.password);
    if (user.value.profile_image) {
      formData.append('profile_image', user.value.profile_image);
    }
    formData.append('status', user.value.status);

    const response = await apiClient.post('/user/store/', formData);
    router.push('/users');
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
    <h5>Create a User</h5>
    <p>Use this page to start from scratch and place your custom content.</p>
    <div class="card p-fluid form-card">
      <form @submit.prevent="addUser">
        <div class="field">
          <label for="first_name">First Name</label>
          <InputText id="first_name" v-model.trim="user.first_name" type="text"
            :class="{ 'p-invalid': errors.first_name && errors.first_name[0] }" />
          <small v-if="errors.first_name" class="p-error font-medium">{{ errors.first_name[0] }}</small>

        </div>
        <div class="field">
          <label for="last_name">Last Name</label>
          <InputText id="last_name" v-model.trim="user.last_name" type="text"
            :class="{ 'p-invalid': errors.last_name && errors.last_name[0] }" />
          <small v-if="errors.last_name" class="p-error font-medium">{{ errors.last_name[0] }}</small>

        </div>
        <div class="field">
          <label for="email">Email</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-user" />
            <InputText id="email" v-model.trim="user.email" type="email"
              :class="{ 'p-invalid': errors.email && errors.email[0] }" />
            <small v-if="errors.email" class="p-error font-medium">{{ errors.email[0] }}</small>

          </IconField>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-lock" />
            <InputText id="password" v-model.trim="user.password" type="password"
              :class="{ 'p-invalid': errors.password && errors.password[0] }" />
            <small v-if="errors.password" class="p-error font-medium">{{ errors.password[0] }}</small>
          </IconField>
        </div>
        <div class="field">
          <label for="profile_image">Upload Profile Image</label>
          <input id="profile_image" type="file" @change="handleFileUpload" accept="image/*"
            :class="{ 'p-invalid': errors.profile_image && errors.profile_image[0] }" />
          <small v-if="errors.profile_image" class="p-error font-medium">{{ errors.profile_image[0] }}</small>

        </div>
        <div class="field">
          <label for="status">Status</label>
          <Dropdown v-model="status" :options="statusValues" optionLabel="name" placeholder="Select" />
        </div>
        <ButtonGroup>
          <RouterLink :to="{ name: 'users' }">
            <Button label="Cancel" severity="danger" />
          </RouterLink>
          <Button label="Create " type="submit" />


        </ButtonGroup>


      </form>
    </div>
  </div>
</template>
