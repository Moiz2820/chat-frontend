<script setup>
import apiClient from '@/http';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted,computed, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { MEDIA_BASE_URL } from '@/config';
import { useRoute, useRouter } from 'vue-router';


const toast = useToast();
const route = useRoute();
const router = useRouter();
const message = ref('');
const products = ref(null);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',

    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const emptyUrl = computed(() => {
    return `layout/images/profile.png`;
});

const fetchContacts = async () => {
    try {
        const response = await apiClient.get('/review/');
        console.log(response);
        products.value = response.data.data;

    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
};

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    fetchContacts();
    if (route.query.message) {
        message.value = route.query.message;
        toast.add({ severity: 'success', summary: 'Successful', detail: message.value, life: 3000 });
    }

});

const confirmDeleteProduct = (editUser) => {
    product.value = editUser;
    deleteProductDialog.value = true;
};

const deleteProduct = async () => {
    try {
        const id = product.value.id;
        const response = await UserService.deleteUser(id);
    } catch (error) {
        console.error('Error creating user:', error);
    }
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
};

const findIndexById = (id) => {
    // let index = -1;
    // for (let i = 0; i < products.value.length; i++) {
    //     if (products.value[i].id === id) {
    //         index = i;
    //         break;
    //     }
    // }
    // return index;
}

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">

                <DataTable ref="dt" :value="products" v-model:selection="selectedProducts" dataKey="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} contacts">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Reviews</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value"
                                    placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
                    
                    <Column field="user" header="User" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">User</span>
                            {{ slotProps.data.user.first_name }} {{ slotProps.data.user.last_name }}
                        </template>
                    </Column>
                    <Column field="doctor" header="Phlebotomist" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Doctor</span>
                            {{ slotProps.data.doctor.first_name }} {{ slotProps.data.doctor.last_name }}
                        </template>
                    </Column>
                    <Column field="rating" header="Rating" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rating</span>
                            {{ slotProps.data.rating }}
                        </template>
                    </Column>
                    <Column field="comment" header="Comment" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">comment</span>
                            {{ slotProps.data.comment }}
                        </template>
                    </Column>
                    <!-- <Column field="first_name" header="User Name" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">User</span>
                            <div class="user-info">
                                <img v-if="slotProps.data.user.profile_image"
                                     :src="MEDIA_BASE_URL + slotProps.data.user.profile_image"
                                     :alt="slotProps.data.user.profile_image"
                                     class="shadow-2 profile" width="100" />
                                <img v-else
                                     :src="emptyUrl"
                                     class="shadow-2 profile" width="100" />
                                <span class="user-name">{{ slotProps.data.user.first_name }} {{ slotProps.data.user.last_name }}</span>
                            </div>
                        </template>
                    </Column> -->
                    <Column field="created_at" header="Created At" :sortable="true"
                        headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatDate(slotProps.data.created_at)
                            }}
                        </template>
                    </Column>
                    <!-- <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <router-link :to="{ name: 'edit-contact', params: { id: slotProps.data.id } }">
                                <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded />

                            </router-link>
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column> -->
                </DataTable>



                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete <b>{{ product.first_name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
