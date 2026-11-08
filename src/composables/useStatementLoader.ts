import { ref } from 'vue'
import { readStatementFile } from '@/lib/loadStatement'
import { useStatementStore } from '@/stores/statement'

export function useStatementLoader() {
  const statement = useStatementStore()
  const loading = ref(false)
  const error = ref('')

  async function load(files: FileList | File[]) {
    loading.value = true
    error.value = ''
    const problems: string[] = []
    for (const file of Array.from(files)) {
      try {
        statement.addStatement(file.name, await readStatementFile(file))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'خطای نامشخص'
        problems.push(`«${file.name}»: ${message}`)
      }
    }
    if (problems.length) error.value = problems.join('\n')
    loading.value = false
  }

  return { loading, error, load }
}
