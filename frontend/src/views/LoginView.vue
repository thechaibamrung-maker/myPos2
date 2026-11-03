<template>
  <div class="login-container">
    <div class="login-box">
      <h2>ระบบประเมินบุคลากร</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>Username</label>
          <input type="text" v-model="username" required placeholder="กรอก Username" />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" required placeholder="กรอก Password" />
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: username.value,
      password: password.value
    })

    if (response.data.status === 'success') {
      const { token, role } = response.data.data
      
      // เก็บ Token และ Role ลงใน Browser
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)

      // ตรวจสอบสิทธิ์แล้วแยกไปตามหน้าจอ
      if (role === 'hr') router.push('/hr')
      else if (role === 'evaluator') router.push('/evaluator')
      else if (role === 'evaluatee') router.push('/evaluatee')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  }
}
</script>

<style scoped>
/* CSS ทำให้หน้าจอดูเป็นระเบียบและ Responsive เบื้องต้น */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
}
.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
.input-group {
  margin-bottom: 1rem;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
}
.input-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover { background-color: #2563eb; }
.error { color: red; margin-bottom: 1rem; font-size: 0.875rem; }
</style>