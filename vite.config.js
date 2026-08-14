import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages는 https://<user>.github.io/<repo>/ 형태의 서브 경로로 서비스되므로
// base를 저장소 이름으로 고정한다 (dev/preview에서도 동일한 경로로 접근: /yhs_test/).
export default defineConfig({
  plugins: [react()],
  base: '/yhs_test/',
})
