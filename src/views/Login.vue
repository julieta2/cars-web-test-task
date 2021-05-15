<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>
    </v-row>
    <form @keyup.enter="submit">
      <v-text-field
          v-model="email"
          :error-messages="emailErrors"
          label="E-mail"
          required
          @input="$v.email.$touch()"
          @blur="$v.email.$touch()"
      ></v-text-field>
      <v-text-field
          v-model="password"
          :error-messages="passwordErrors"
          label="Password"
          required
          type="password"
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
      ></v-text-field>

      <v-btn
          class="mr-4"
          @click="submit"
          color="primary"
          :loading="loading"
      >
        login
      </v-btn>
    </form>
  </v-container>
</template>

<script>
  import { validationMixin } from 'vuelidate';
  import { required, minLength, email } from 'vuelidate/lib/validators';
  import axios from 'axios';

  export default {
    name: 'Login',
    mixins: [validationMixin],

    validations: {
      email: { required, email },
      password: { required, minLength: minLength(6) },
    },

    data: () => ({
      loading: false,
      email: '',
      password: '',
    }),

    computed: {
      emailErrors () {
        const errors = []
        if (!this.$v.email.$dirty) return errors
        !this.$v.email.email && errors.push('Must be valid e-mail')
        !this.$v.email.required && errors.push('E-mail is required')
        return errors
      },
      passwordErrors () {
        const errors = []
        if (!this.$v.password.$dirty) return errors
        !this.$v.password.minLength && errors.push('Length of the password must be at least 6.')
        !this.$v.password.required && errors.push('E-mail is required')
        return errors
      },
    },

    methods: {
      submit () {
        this.$v.$touch()
        if (!this.$v.$invalid) {
          this.loading = true

          axios.post(`${process.env.VUE_APP_API_URL}/login`, {
            email: this.email,
            password: this.password,
          })
              .then((response) => {
                const token = response.data.token;
                this.handleLogin(token);
                this.$router.push('/');
              })
              .catch((error) => {
                console.log(error);
              })
              .then(() => {
                this.loading = false
              });
        }
      },

      handleLogin (token) {
        localStorage.setItem('token', token);
      }
    },

  }
</script>
