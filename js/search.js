/**
 * Search Module
 * 클라이언트 사이드 검색 기능
 */

(function() {
  'use strict';

  // 검색용 게시글 데이터 (app.js에서 설정)
  let searchPosts = [];
  let searchTimeout = null;
  const DEBOUNCE_DELAY = 300;

  /**
   * 검색 데이터 설정 (app.js에서 호출)
   */
  function setSearchData(posts) {
    searchPosts = posts;
  }

  /**
   * 검색 실행
   */
  function performSearch(query) {
    if (!query || query.trim() === '') {
      return searchPosts;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);

    return searchPosts.filter(post => {
      // 검색 대상: 제목, 설명, 발췌문, 태그, 카테고리
      const searchableText = [
        post.title || '',
        post.description || '',
        post.excerpt || '',
        post.category || '',
        ...(post.tags || [])
      ].join(' ').toLowerCase();

      // 모든 검색어가 포함되어야 함 (AND 검색)
      return queryWords.every(word => searchableText.includes(word));
    });
  }

  /**
   * 검색 결과 하이라이트
   */
  function highlightText(text, query) {
    if (!query || !text) return text;
    
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    let result = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    
    return result;
  }

  /**
   * 정규식 특수문자 이스케이프
   */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 검색 입력 디바운싱
   */
  function debounceSearch(callback) {
    return function(event) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        callback(event.target.value);
      }, DEBOUNCE_DELAY);
    };
  }

  /**
   * 검색 초기화
   */
  function initSearch(onSearchCallback) {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
      // 입력 이벤트 (디바운싱 적용)
      searchInput.addEventListener('input', debounceSearch((query) => {
        const results = performSearch(query);
        if (onSearchCallback) {
          onSearchCallback(results, query);
        }
      }));

      // Enter 키 처리 (즉시 검색)
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          clearTimeout(searchTimeout);
          const results = performSearch(event.target.value);
          if (onSearchCallback) {
            onSearchCallback(results, event.target.value);
          }
        }
      });

      // ESC 키로 검색 초기화
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          searchInput.value = '';
          const results = performSearch('');
          if (onSearchCallback) {
            onSearchCallback(results, '');
          }
        }
      });
    }
  }

  // 전역 함수로 내보내기
  window.BlogSearch = {
    setSearchData,
    performSearch,
    highlightText,
    initSearch
  };
})();

