<script setup>
import { ref, onMounted } from 'vue';
import UserService from '@/service/UserService';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/http';
import { MEDIA_BASE_URL } from '@/config';

// import { InputText } from 'primevue/inputtext';
// import { Dropdown } from 'primevue/dropdown';
// import { Button } from 'primevue/button';

const route = useRoute();
const router = useRouter();
const contactId = route.params.id;

const contact = ref({});
const name = ref('');
const phone = ref('');
const image = ref(null);
const errors = ref([]);
const loading = ref(false);
const contact_img = ref('');



onMounted(async () => {
  try {
    const response = await apiClient.get('admin/contact/' + contactId);
    contact.value = response.data.data;
    name.value = contact.value.name;
    phone.value = contact.value.phone;
    contact_img.value = contact.value.image;
  } catch (error) {
    console.error('Error fetching contact:', error);
  }
});

const handleFileUpload = (event) => {
  image.value = event.target.files[0];
};

const updateUser = async () => {
  loading.value = true;
  try {
    const formData = new FormData()
    formData.append('name', name.value);
    formData.append('phone', phone.value);
    if (image.value) {
      formData.append('image', image.value);
    }


    const response = await apiClient.post('/admin/contact/update/' + contactId, formData);
    router.push({ path: '/contacts', query: { message: 'Contact has been updated' } });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error logging in:', error);
    }
  }
  finally{
    loading.value = false;
  }
  
};
</script>

<template>
  <div class="card">
    <h5>Edit Contact</h5>
    <div class="card p-fluid form-card">
      <form @submit.prevent="updateUser">
        <div class="form-header">
          <img v-if="contact_img" :src="MEDIA_BASE_URL + contact_img" alt="Profile Image" class="profile-image">
        </div>
        <div class="field">
          <label for="name">Name</label>
          <InputText id="name" v-model.trim="name" type="text" :class="{ 'p-invalid': errors.name && errors.name[0] }" />
          <small v-if="errors.name" class="p-error font-medium">{{ errors.name[0] }}</small>
        </div>
        <div class="field">
          <label for="phone">Phone</label>
          <InputText id="phone" v-model.trim="phone" type="tel" :class="{ 'p-invalid': errors.phone && errors.phone[0] }" />
          <small v-if="errors.phone" class="p-error font-medium">{{ errors.phone[0] }}</small>
        </div>
        <div class="field">
          <label for="image">Upload  Image</label>
          <input id="image" type="file" @change="handleFileUpload" accept="image/*" :class="{ 'p-invalid': errors.image && errors.image[0] }" />
          <small v-if="errors.image" class="p-error font-medium">{{ errors.image[0] }}</small>
        </div>
    
        <ButtonGroup>
          <RouterLink :to="{ name: 'contacts' }">
            <Button label="Cancel" severity="danger" />
          </RouterLink>
          <Button type="submit" :label="loading ? '' : 'Update'" value="submit" :loading="loading" class="p-button p-component">
            <template v-if="loading">
              <ProgressSpinner style="width: 20px; height: 20px;" strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s"/>
            </template>
          </Button>
        </ButtonGroup>
      </form>
    </div>
  </div>
</template>

