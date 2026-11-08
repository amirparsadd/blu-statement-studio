<script setup lang="ts">
import bluLogo from '@/assets/blu-logo.svg'
</script>

<template>
  <header class="mb-8 flex items-center gap-3">
    <img :src="bluLogo" alt="بلو" class="h-7" />
    <div class="h-7 w-px bg-line" />
    <div>
      <div class="text-[16px] font-bold text-navy">استیتمنت استودیو</div>
      <div class="text-[12px] text-muted">تحلیل صورتحساب</div>
    </div>
  </header>
</template>
