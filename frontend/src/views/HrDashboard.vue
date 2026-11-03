<template>
  <div class="layout-wrapper">
    <!-- แถบเมนูด้านบน (Navbar) -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo-icon">📊</span>
        <h1>HR System <span class="badge">Workspace</span></h1>
      </div>
      <button @click="logout" class="btn-logout">
        <span class="icon">🚪</span> ออกจากระบบ
      </button>
    </nav>

    <!-- พื้นที่เนื้อหาหลัก -->
    <main class="main-content">
      <div class="card">
        <div class="card-header">
          <h2>📝 สร้างแบบประเมินผลการปฏิบัติงาน</h2>
          <p class="subtitle">กำหนดหัวข้อและตัวชี้วัดสำหรับการประเมินบุคลากร</p>
        </div>

        <form @submit.prevent="createEvaluation" class="eval-form">
          <!-- ส่วนที่ 1: ข้อมูลหลัก -->
          <fieldset class="form-section">
            <legend>ข้อมูลแบบประเมิน</legend>
            <div class="form-group full-width">
              <label>หัวข้อการประเมิน <span class="required">*</span></label>
              <input v-model="form.title" type="text" required placeholder="ระบุชื่อหัวข้อ เช่น การประเมินผลงานไตรมาสที่ 1/2569" class="input-field" />
            </div>
            
            <div class="grid-2-cols">
              <div class="form-group">
                <label>วันที่เริ่มต้น <span class="required">*</span></label>
                <input v-model="form.start_date" type="date" required class="input-field" />
              </div>
              <div class="form-group">
                <label>วันที่สิ้นสุด <span class="required">*</span></label>
                <input v-model="form.end_date" type="date" required class="input-field" />
              </div>
            </div>
          </fieldset>

          <!-- ส่วนที่ 2: ตัวชี้วัด -->
          <fieldset class="form-section indicator-section">
            <div class="section-header">
              <legend>เกณฑ์ตัวชี้วัด (KPIs)</legend>
              <button type="button" @click="addIndicator" class="btn-add">
                + เพิ่มตัวชี้วัด
              </button>
            </div>

            <div class="indicator-list">
              <transition-group name="fade">
                <div v-for="(indicator, index) in form.indicators" :key="index" class="indicator-card">
                  <div class="indicator-header">
                    <span class="indicator-number">ตัวชี้วัดที่ {{ index + 1 }}</span>
                    <button type="button" @click="removeIndicator(index)" class="btn-delete-icon" v-if="form.indicators.length > 1" title="ลบตัวชี้วัด">
                      ❌
                    </button>
                  </div>
                  
                  <div class="grid-2-cols">
                    <div class="form-group full-width">
                      <label>ชื่อตัวชี้วัด <span class="required">*</span></label>
                      <input v-model="indicator.name" type="text" required placeholder="เช่น ความรับผิดชอบต่องาน" class="input-field" />
                    </div>
                    <div class="form-group full-width">
                      <label>รายละเอียด/คำอธิบาย</label>
                      <textarea v-model="indicator.description" rows="2" placeholder="อธิบายเกณฑ์การพิจารณา..." class="input-field"></textarea>
                    </div>
                    <div class="form-group">
                      <label>น้ำหนักคะแนน (%) <span class="required">*</span></label>
                      <input v-model="indicator.weight" type="number" min="1" max="100" required class="input-field" />
                    </div>
                    <div class="form-group">
                      <label>รูปแบบการประเมิน</label>
                      <select v-model="indicator.criteria_type" class="input-field">
                        <option value="scale_1_4">ให้คะแนนระดับ 1-4 (Scale)</option>
                        <option value="yes_no">ผ่าน / ไม่ผ่าน (Yes/No)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
          </fieldset>

          <!-- ส่วนแสดงข้อความและปุ่ม Submit -->
          <div class="form-actions">
            <div v-if="message" class="alert" :class="isSuccess ? 'alert-success' : 'alert-danger'">
              {{ message }}
            </div>
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'กำลังบันทึกข้อมูล...' : '💾 บันทึกแบบประเมิน' }}
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

const form = ref({
  title: '',
  start_date: '',
  end_date: '',
  indicators: [
    { name: '', description: '', weight: 0, criteria_type: 'scale_1_4', attachment_path: null }
  ]
})

const addIndicator = () => {
  form.value.indicators.push({ name: '', description: '', weight: 0, criteria_type: 'scale_1_4', attachment_path: null })
}

const removeIndicator = (index) => {
  form.value.indicators.splice(index, 1)
}

const createEvaluation = async () => {
  isLoading.value = true
  message.value = ''
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post('http://localhost:3000/api/evaluations', form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.status === 'success') {
      isSuccess.value = true
      message.value = '✅ สร้างแบบประเมินและตัวชี้วัดสำเร็จ!'
      form.value = {
        title: '', start_date: '', end_date: '',
        indicators: [{ name: '', description: '', weight: 0, criteria_type: 'scale_1_4', attachment_path: null }]
      }
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

/* ตั้งค่าพื้นฐาน */
* {
  font-family: 'Kanit', sans-serif;
  box-sizing: border-box;
}

.layout-wrapper {
  min-height: 100vh;
  background-color: #f1f5f9; /* โทนเทาอ่อนสบายตา */
  display: flex;
  flex-direction: column;
}

/* Navbar สไตล์องค์กร */
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-brand h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid #bfdbfe;
}

.btn-logout {
  background: transparent;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #f87171;
  color: white;
  border-color: #f87171;
}

/* พื้นที่เนื้อหาหลัก */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h2 {
  margin: 0 0 0.25rem 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.eval-form {
  padding: 2rem;
}

/* Form Styles */
.form-section {
  border: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.form-section legend {
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  width: 100%;
}

.grid-2-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.full-width {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.required {
  color: #ef4444;
}

.input-field {
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #f8fafc;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.input-field {
  resize: vertical;
}

/* Indicator Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.btn-add {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #059669;
}

.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.indicator-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.indicator-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.indicator-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.9rem;
  background: #eff6ff;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.btn-delete-icon {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-delete-icon:hover {
  opacity: 1;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Actions & Alerts */
.form-actions {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-submit {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .grid-2-cols {
    grid-template-columns: 1fr; /* บนมือถือปรับเป็นคอลัมน์เดียว */
  }
  .main-content {
    padding: 1rem;
  }
  .eval-form {
    padding: 1.5rem;
  }
}
</style>