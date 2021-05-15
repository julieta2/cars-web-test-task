<template>
  <div>
    <v-data-table
        :headers="headers"
        :items="cars"
        :options.sync="options"
        :server-items-length="totalCars"
        :loading="loading"
        class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-toolbar-title>Cars</v-toolbar-title>
          <v-divider
              class="mx-4"
              inset
              vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-dialog
              v-model="dialog"
              max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
              >
                New
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-text-field
                    v-model="brand"
                    :error-messages="brandErrors"
                    label="Brand"
                    required
                    @input="$v.brand.$touch()"
                    @blur="$v.brand.$touch()"
                    @keyup.enter="save"
                ></v-text-field>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                    color="primary"
                    @click="save"
                    :loading="newOrEditLoading"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn
                    color="primary"
                    @click="deleteItemConfirm"
                    :loading="deleteLoading"
                >OK
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.brand="{ item }">
        <v-btn text component="router-link" :to="`/cars/${item.id}`">
          {{ item.brand }}
        </v-btn>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
            small
            @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        No Items Found
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axiosInstance from '../axiosInstance';
import {validationMixin} from 'vuelidate'
import {required} from 'vuelidate/lib/validators'

export default {
  name: 'Cars',
  mixins: [validationMixin],

  validations: {
    brand: {required},
  },

  data: () => ({
    loading: true,
    deleteLoading: false,
    newOrEditLoading: false,
    totalCars: 0,
    cars: [],
    options: {
      page: 1,
      itemsPerPage: 10,
    },
    headers: [
      {
        text: 'Brand',
        value: 'brand',
        sortable: false,
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      },
    ],
    editedIndex: -1,
    editedItem: {},
    brand: '',
    dialog: false,
    dialogDelete: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Car' : 'Edit Car';
    },
    brandErrors() {
      const errors = [];
      if (!this.$v.brand.$dirty) return errors;
      !this.$v.brand.required && errors.push('Fill the brand');
      return errors;
    },
  },

  watch: {
    options: {
      handler() {
        this.getCars();
      },
      deep: true,
    },
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  mounted() {
    this.getCars();
  },

  methods: {
    getCars() {
      this.loading = true;
      const {page, itemsPerPage} = this.options;

      axiosInstance.get(`/cars?page=${page}&per_page=${itemsPerPage}`)
          .then((response) => {
            this.cars = response.data.data;
            this.totalCars = response.data.total;
          })
          .catch((error) => {
            console.log(error);
          })
          .then(() => {
            this.loading = false;
          });
    },

    editItem(item) {
      this.editedIndex = this.cars.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.brand = item.brand;
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.cars.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.deleteLoading = true;

      axiosInstance.delete(`/cars/${this.editedItem.id}`)
          .then(() => {
            this.cars.splice(this.editedIndex, 1);
          })
          .catch((error) => {
            console.log(error);
          })
          .then(() => {
            this.closeDelete()
            this.deleteLoading = false;
          });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = {};
        this.brand = '';
        this.editedIndex = -1;
        this.$v.$reset();
      })
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = {};
        this.editedIndex = -1;
      })
    },

    save() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.newOrEditLoading = true;

        if (this.editedIndex > -1) {
          axiosInstance.put(`/cars/${this.editedItem.id}`, {
            brand: this.brand,
          })
              .then((response) => {
                Object.assign(this.cars[this.editedIndex], response.data);
              })
              .catch((error) => {
                console.log(error);
              })
              .then(() => {
                this.close();
                this.newOrEditLoading = false;
              });
        } else {
          axiosInstance.post(`/cars`, {
            brand: this.brand,
          })
              .then((response) => {
                const newItem = response.data;
                this.cars = [newItem].concat(this.cars);
              })
              .catch((error) => {
                console.log(error);
              })
              .then(() => {
                this.close();
                this.newOrEditLoading = false;
              });
        }
      }
    },
  },

}
</script>
