<script setup>
import { MEDIA_BASE_URL } from '@/config';
import apiClient from '@/http';
import { ref, onMounted, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const userId = route.params.id;
const user = ref({});

onMounted(async () => {
    try {
        // const response = await UserService.getUser(userId);
        const response = await apiClient.get('/doc/' + userId);
        user.value = response.data.data;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
});
</script>


<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Phlebotomist Profile</h5>
                <div style="display: flex; justify-content: flex-end;">
                    <router-link :to="{ name: 'doctors' }">
                        <Button icon="pi pi-arrow-left" class="mr-2" severity="danger" label="go back" rounded />

                    </router-link>
                    <!-- <Button label="Secondary" severity="secondary" raised class="mb-2 mr-2" /> -->
                </div>
                <div  style="display: flex; justify-content: center; align-items: center; margin-bottom:45px;">
                    <img :src="MEDIA_BASE_URL + user.profile_image" alt="Profile Image" class="w-15rem flex-shrink-0" />
                </div>

                <div class="p-fluid formgrid grid mt-4">
                    <div class="field col-12 md:col-6">
                        <label for="name">First Name</label>
                        <p style="background-color: rgb(253, 248, 248); padding: 5px; border-radius: 5px;"><b>{{
                            user.first_name }}</b></p>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="name">Last Name</label>
                        <p style="background-color: rgb(253, 248, 248); padding: 5px; border-radius: 5px;"><b>{{
                            user.last_name }}</b></p>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="name">Email</label>
                        <p style="background-color: rgb(253, 248, 248); padding: 5px; border-radius: 5px;"><b>{{
                                user.email }}</b></p>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="address">Bio</label>
                        <p style="background-color: rgb(253, 248, 248); padding: 5px; border-radius: 5px;"><b>{{
                                user.bio }}</b></p>
                    </div>

                    <div class="field col-12 md:col-6">
                        <label for="zip">Affiliation</label>
                        <p style="background-color: rgb(253, 248, 248); padding: 5px; border-radius: 5px;"><b>{{
                                user.affiliation }}</b></p>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="zip">Certification</label>
                        <p style="background-color: rgb(253, 248, 248); padding: 5px; border-radius: 5px;"><b>{{
                                user.certification }}</b></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>