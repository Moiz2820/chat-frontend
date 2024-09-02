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
const status = ref(null);
const errors = ref([]);
const profile_img = ref('');

const statusValues = ref([
  { name: 'Active', value: 'Active' },
  { name: 'Inactive', value: 'Inactive' },
]);

onMounted(async () => {
  try {
    const response = await  apiClient.get('/user/'+userId);
    user.value = response.data.data;
    firstName.value = user.value.first_name;
    lastName.value = user.value.last_name;
    status.value = statusValues.value.find(statusOption => statusOption.value === user.value.status);
    profile_img.value = user.value.profile_image;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
});



const updateUser = async () => {
  try {
    user.value.first_name = firstName.value;
    user.value.last_name = lastName.value;
    user.value.status = status.value.value;

    const response = await apiClient.post('/user/update/' + user.value.id, user.value);
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
    <h5>Edit User</h5>
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
          <label for="status">Status</label>
          <Dropdown v-model="status" :options="statusValues" optionLabel="name" placeholder="Select" />
        </div>
        <ButtonGroup>
          <RouterLink :to="{ name: 'users' }">
            <Button label="Cancel" severity="info" />
          </RouterLink>
          <Button label="Update" severity="danger"  />
         

        </ButtonGroup>
      </form>
    </div>
  </div>
</template>
