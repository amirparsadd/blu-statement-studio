<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import UploadPanel from '@/components/UploadPanel.vue'
import Dashboard from '@/components/Dashboard.vue'
import { useStatementStore } from '@/stores/statement'

const statement = useStatementStore()
</script>

<template>
  <div class="mx-auto max-w-5xl px-5 pt-6 pb-16">
    <AppHeader />

    <main>
      <UploadPanel v-if="!statement.hasData" />
      <Dashboard v-else />
    </main>

    <footer class="mt-12 border-t border-line pt-5 text-center text-[12px] leading-relaxed text-muted">
      این پروژه غیررسمی است و وابسته به بلوبانک نیست. این برنامه مستقل است و هیچ ارتباط رسمی با بلو بانک ندارد. نام «بلو» و لوگوی آن متعلق به بلو بانک است.
    </footer>
  </div>
</template>
