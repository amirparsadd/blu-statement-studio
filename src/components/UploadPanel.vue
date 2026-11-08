<script setup lang="ts">
import { ref } from 'vue'
import { useStatementLoader } from '@/composables/useStatementLoader'

const { loading, error, load } = useStatementLoader()
const dragging = ref(false)

function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files.length) load(e.dataTransfer.files)
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) load(input.files)
  input.value = ''
}
</script>

<template>
  <section class="mx-auto max-w-xl pt-6 text-center">
    <h1 class="text-[28px] font-bold text-navy">صورتحساب بلوی خود را تحلیل کنید</h1>
    <p class="mt-3 text-[14px] leading-relaxed text-muted">
      فایل اکسل صورتحساب را انتخاب کنید. اگر بیش از یک فایل دارید، همه را یکجا اضافه کنید.
    </p>

    <label
      class="card mt-8 block cursor-pointer border-2 border-dashed p-10 transition"
      :class="dragging ? 'border-blu bg-[#f0f6fd]' : 'hover:border-blu'"
      @dragover.prevent="dragging = true"
      @dragenter.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="text-[15px] font-semibold">فایل‌های xlsx را اینجا رها کنید</div>
      <div class="mt-1.5 text-[12.5px] text-muted">یا کلیک کنید تا انتخاب شوند</div>
      <span class="btn mt-5">انتخاب فایل</span>
      <input type="file" accept=".xlsx,.xls" multiple class="hidden" @change="onPick" />
    </label>

    <div v-if="loading" class="mt-5 text-[13px] text-muted">در حال خواندن فایل…</div>

    <div
      v-if="error"
      class="mt-5 rounded-lg border border-expense/30 bg-[#fdf2f2] px-4 py-3 text-right text-[13px] leading-relaxed whitespace-pre-line text-expense"
    >
      {{ error }}
    </div>
  </section>
</template>
