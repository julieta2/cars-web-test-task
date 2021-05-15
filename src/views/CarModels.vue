<template>
  <div>
    <v-data-table
        :headers="headers"
        :items="carModels"
        :loading="loading"
        :search="search"
        class="elevation-1"
        disable-pagination
        hide-default-footer
    >
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-btn
              icon
              component="router-link"
              to="/"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>{{ carBrand }} - Models</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
          ></v-text-field>
          <v-divider
              class="mx-4"
              inset
              vertical
          ></v-divider>
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
                    v-model="model"
                    :error-messages="modelErrors"
                    label="Model"
                    required
                    @input="$v.model.$touch()"
                    @blur="$v.model.$touch()"
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
  name: 'CarModels',
  mixins: [validationMixin],

  validations: {
    model: {required},
  },

  data: () => ({
    loading: true,
    deleteLoading: false,
    newOrEditLoading: false,
    carModels: [],
    headers: [
      {
        text: 'Model',
        value: 'model',
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
    model: '',
    dialog: false,
    dialogDelete: false,
    carId: null,
    carBrand: null,
    search: '',
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Model' : 'Edit Model';
    },
    modelErrors() {
      const errors = [];
      if (!this.$v.model.$dirty) return errors;
      !this.$v.model.required && errors.push('Fill the model');
      return errors;
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  mounted() {
    this.carId = this.$route.params.id;
    this.getCarModels();
  },

  methods: {
    getCarModels() {
      this.loading = true;

      axiosInstance.get(`/cars/${this.carId}`)
          .then((response) => {
            this.carModels = response.data.models;
            this.carBrand = response.data.brand;
          })
          .catch((error) => {
            console.log(error);
          })
          .then(() => {
            this.loading = false;
          });
    },

    editItem(item) {
      this.editedIndex = this.carModels.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.model = item.model;
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.carModels.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.deleteLoading = true;

      axiosInstance.delete(`/car-models/${this.editedItem.id}`)
          .then(() => {
            this.carModels.splice(this.editedIndex, 1);
          })
          .catch((error) => {
            console.log(error);
          })
          .then(() => {
            this.closeDelete();
            this.deleteLoading = false;
          });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = {};
        this.model = '';
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
          axiosInstance.put(`/car-models/${this.editedItem.id}`, {
            model: this.model,
          })
              .then((response) => {
                Object.assign(this.carModels[this.editedIndex], response.data);
              })
              .catch((error) => {
                console.log(error);
              })
              .then(() => {
                this.close();
                this.newOrEditLoading = false;
              });
        } else {
          axiosInstance.post(`/car-models`, {
            car_id: this.carId,
            model: this.model,
          })
              .then((response) => {
                const newItem = response.data;
                this.carModels = [newItem].concat(this.carModels);
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
