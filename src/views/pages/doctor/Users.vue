<script setup>
import { FilterMatchMode } from 'primevue/api';
import apiClient from '@/http';
import { ref, onMounted,computed, onBeforeMount } from 'vue';
import UserService from '@/service/UserService';
import { useToast } from 'primevue/usetoast';
import { MEDIA_BASE_URL } from '@/config';

const toast = useToast();

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
const logoUrl = computed(() => {
    return `layout/images/profile.png`;
});
const fetchUsers = async () => {
    try {
        const response = await  apiClient.get('/doc/');
        // console.log(response.data.users[0])
        products.value = response.data.users;


    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    fetchUsers();
});

const confirmDeleteProduct = (editUser) => {
    product.value = editUser;
    deleteProductDialog.value = true;
};

const deleteProduct = async () => {
    try {
        const id = product.value.id;
        const response = await UserService.deleteUser(id);
        console.log('deleted', response.data);
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
};



const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};

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
                <!-- <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            
                            <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                                :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

<template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import"
                            chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
</Toolbar> -->

                <DataTable ref="dt" :value="products" v-model:selection="selectedProducts" dataKey="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">
                                <!-- <router-link :to="{ name: 'create-user' }">

                                    <Button label="New" icon="pi pi-plus" class="mr-2 p-button" />
                                </router-link>  -->
                                Manage Phlebotomists </h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value"
                                    placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img v-if="slotProps.data.profile_image"
                                :src="MEDIA_BASE_URL + slotProps.data.profile_image" :alt="slotProps.data.first_name"
                                class="shadow-2 profile" width="100" />
                            <img v-else
                                :src="logoUrl" 
                                class="shadow-2 profile" width="100" />

                        </template>
                    </Column>
                    <Column field="first_name" header="Name" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">First Name</span>
                            <!-- <img :src="MEDIA_BASE_URL + slotProps.data.profile_image" :alt="slotProps.data.first_name"
                                class="shadow-2 avatar" width="100" /> -->
                            {{ slotProps.data.first_name }} {{ slotProps.data.last_name }}
                        </template>
                    </Column>
                    <!-- <Column field="last_name" header="Last Name" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Last Name</span>
                            {{ slotProps.data.last_name }}
                        </template>
                    </Column> -->

                    <Column field="email" header="Email" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">email</span>
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column field="rating" header="Rating" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rating</span>
                            {{ slotProps.data.avg_rating }}
                        </template>
                    </Column>
                    <!-- <Column field="created_at" header="Created At" :sortable="true"
                        headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Created AT</span>
                            {{ formatDate(slotProps.data.created_at)
                            }}
                        </template>
                    </Column> -->


                    <Column field="inventoryStatus" header="Status" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            {{ slotProps?.data?.status ?? 'undefined' }}
                            <!-- <Tag :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Tag> -->
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <!--  -->
                            <router-link :to="{ name: 'view-doctor', params: { id: slotProps.data.id } }">
                                <Button icon="pi pi-eye" class="mr-2" severity="secondary" rounded />

                            </router-link>
                            <router-link :to="{ name: 'edit-doctor', params: { id: slotProps.data.id } }">
                                <Button icon="pi pi-pencil" class="mr-2" severity="info" rounded />

                            </router-link>
                            
                            <Button icon="pi pi-trash" class="mt-2" severity="danger" rounded
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
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

                <!-- <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products? {{product.value}}</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
                    </template>
                </Dialog> -->
            </div>
        </div>
    </div>
</template>
