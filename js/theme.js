/**
 * Theme Toggle Module
 * 다크/라이트 모드 전환 기능
 */

(function() {
  'use strict';

  const THEME_KEY = 'blog-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  /**
   * 저장된 테마 또는 시스템 설정 기반 초기 테마 가져오기
   */
  function getInitialTheme() {
    // 1. 로컬 스토리지에서 저장된 테마 확인
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      return savedTheme;
    }

    // 2. 시스템 설정 확인
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK_THEME;
    }

    // 3. 기본값: 라이트 테마
    return LIGHT_THEME;
  }

  /**
   * 테마 적용
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Giscus 테마 동기화 (있는 경우)
    updateGiscusTheme(theme);
  }

  /**
   * Giscus 댓글 테마 업데이트
   */
  function updateGiscusTheme(theme) {
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
      const giscusTheme = theme === DARK_THEME ? 'dark' : 'light';
      giscusFrame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      );
    }
  }

  /**
   * 테마 토글
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    applyTheme(newTheme);
  }

  /**
   * 초기화
   */
  function init() {
    // 초기 테마 적용
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // 테마 토글 버튼 이벤트 리스너
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // 시스템 테마 변경 감지
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // 사용자가 수동으로 테마를 설정하지 않은 경우에만 자동 전환
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (!savedTheme) {
          applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
        }
      });
    }
  }

  // DOM 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 전역 함수로 내보내기 (선택적)
  window.toggleTheme = toggleTheme;
})();

