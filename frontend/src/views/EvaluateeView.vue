<template>
  <div class="layout-wrapper">
    <!-- แถบเมนูด้านบน (Navbar) -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo-icon">👤</span>
        <h1>Evaluatee <span class="badge">Workspace</span></h1>
      </div>
      <button @click="logout" class="btn-logout">
        <span class="icon">🚪</span> ออกจากระบบ
      </button>
    </nav>

    <!-- พื้นที่เนื้อหาหลัก -->
    <main class="main-content">
      <div class="card">
        <div class="card-header">
          <h2>📝 แบบฟอร์มประเมินตนเอง (Self-Evaluation)</h2>
          <p class="subtitle">กรุณากรอกผลการปฏิบัติงานและประเมินคะแนนตนเองตามตัวชี้วัด</p>
        </div>

        <form @submit.prevent="submitSelfEval" class="eval-form">
          
          <!-- ตัวชี้วัดที่ 1 -->
          <fieldset class="form-section indicator-section">
            <legend>ตัวชี้วัดที่ 1: ความตรงต่อเวลา</legend>
            <div class="grid-2-cols">
              <div class="form-group full-width">
                <label>ผลการปฏิบัติงาน (อธิบายสิ่งที่ทำได้) <span class="required">*</span></label>
                <textarea v-model="form.scores[0].self_info" rows="2" required placeholder="เช่น เข้าทำงานตรงเวลา ไม่เคยมาสาย..." class="input-field"></textarea>
              </div>
              <div class="form-group">
                <label>ประเมินคะแนนตนเอง (1-4) <span class="required">*</span></label>
                <input v-model="form.scores[0].self_score" type="number" min="1" max="4" required class="input-field" />
              </div>
            </div>
          </fieldset>

          <!-- ตัวชี้วัดที่ 2 -->
          <fieldset class="form-section indicator-section" style="margin-top: 2rem;">
            <legend>ตัวชี้วัดที่ 2: ประสิทธิภาพการทำงาน</legend>
            <div class="grid-2-cols">
              <div class="form-group full-width">
                <label>ผลการปฏิบัติงาน (อธิบายสิ่งที่ทำได้) <span class="required">*</span></label>
                <textarea v-model="form.scores[1].self_info" rows="2" required placeholder="เช่น สามารถทำงานเสร็จตามเป้าหมาย..." class="input-field"></textarea>
              </div>
              <div class="form-group">
                <label>ประเมินคะแนนตนเอง (1-4) <span class="required">*</span></label>
                <input v-model="form.scores[1].self_score" type="number" min="1" max="4" required class="input-field" />
              </div>
            </div>
          </fieldset>

          <!-- ส่วนแสดงข้อความและปุ่ม Submit -->
          <div class="form-actions">
            <div v-if="message" class="alert" :class="isSuccess ? 'alert-success' : 'alert-danger'">
              {{ message }}
            </div>
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'กำลังบันทึกข้อมูล...' : '💾 ส่งผลการประเมินตนเอง' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isLoading = ref(false)
const message = ref('')
const isSuccess = ref(false)

// ผูกข้อมูลตรงตาม Database
const form = ref({
  scores: [
    { indicator_id: 1, self_info: '', self_score: null },
    { indicator_id: 2, self_info: '', self_score: null }
  ]
})

const submitSelfEval = async () => {
  isLoading.value = true
  message.value = ''
  try {
    const token = localStorage.getItem('token')
    // ยิง API ไปที่ Backend ของผู้รับการประเมิน
    const response = await axios.post('http://localhost:3000/api/evaluatee/evaluations/1/self', form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.status === 'success') {
      isSuccess.value = true
      message.value = '✅ บันทึกข้อมูลการประเมินตนเองเรียบร้อยแล้ว!'
      setTimeout(() => { message.value = '' }, 3000)
    }
  } catch (error) {
    isSuccess.value = false
    message.value = error.response?.data?.message || '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap');

/* ตั้งค่าพื้นฐานเหมือนหน้า HR */
* { font-family: 'Kanit', sans-serif; box-sizing: border-box; }
.layout-wrapper { min-height: 100vh; background-color: #f1f5f9; display: flex; flex-direction: column; }
.navbar { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0.75rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); position: sticky; top: 0; z-index: 10; }
.nav-brand { display: flex; align-items: center; gap: 0.75rem; }
.nav-brand h1 { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.badge { font-size: 0.75rem; background: #f3e8ff; color: #9333ea; padding: 0.2rem 0.5rem; border-radius: 9999px; border: 1px solid #d8b4fe; }
.btn-logout { background: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; }
.btn-logout:hover { background: #f87171; color: white; border-color: #f87171; }

.main-content { flex: 1; padding: 2rem; max-width: 900px; margin: 0 auto; width: 100%; }
.card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
.card-header { background: #f8fafc; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; }
.card-header h2 { margin: 0 0 0.25rem 0; color: #0f172a; font-size: 1.5rem; }
.subtitle { margin: 0; color: #64748b; font-size: 0.95rem; }
.eval-form { padding: 2rem; }

.form-section { border: none; padding: 0; margin: 0; }
.form-section legend { font-size: 1.1rem; font-weight: 600; color: #334155; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; width: 100%; }
.grid-2-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.full-width { grid-column: 1 / -1; }
label { font-size: 0.9rem; font-weight: 500; color: #475569; }
.required { color: #ef4444; }

/* ช่องกรอกข้อมูล */
.input-field { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s, box-shadow 0.2s; background-color: #f8fafc; color: #000; }
.input-field:focus { outline: none; border-color: #3b82f6; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
textarea.input-field { resize: vertical; }

.form-actions { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem; }
.btn-submit { background: #3b82f6; color: white; border: none; padding: 0.8rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: background 0.2s; }
.btn-submit:hover:not(:disabled) { background: #2563eb; }
.btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }

.alert { padding: 0.75rem 1rem; border-radius: 6px; font-weight: 500; text-align: center; }
.alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.alert-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

@media (max-width: 768px) {
  .grid-2-cols { grid-template-columns: 1fr; }
  .main-content { padding: 1rem; }
  .eval-form { padding: 1.5rem; }
}
</style>