/**
 * Main Application Module
 * 메인 페이지 게시글 목록 로딩 및 필터링
 */

(function() {
  'use strict';

  // 상태 관리
  let allPosts = [];
  let filteredPosts = [];
  let activeTag = null;
  let currentSearchQuery = '';

  // DOM 요소
  const postsListEl = document.getElementById('posts-list');
  const loadingEl = document.getElementById('loading');
  const noPostsEl = document.getElementById('no-posts');
  const tagFilterEl = document.getElementById('tag-filter');

  /**
   * posts.json에서 게시글 목록 로드
   */
  async function loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('Failed to load posts.json');
      }
      
      allPosts = await response.json();
      filteredPosts = [...allPosts];
      
      // 검색 모듈에 데이터 설정
      if (window.BlogSearch) {
        window.BlogSearch.setSearchData(allPosts);
      }
      
      // 태그 필터 생성
      renderTagFilter();
      
      // 게시글 목록 렌더링
      renderPosts(filteredPosts);
      
    } catch (error) {
      console.error('Error loading posts:', error);
      showError('게시글을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 게시글 목록 렌더링
   */
  function renderPosts(posts, searchQuery = '') {
    hideLoading();
    
    if (!posts || posts.length === 0) {
      postsListEl.innerHTML = '';
      showNoPosts();
      return;
    }
    
    hideNoPosts();
    
    const postsHTML = posts.map((post, index) => {
      const title = searchQuery 
        ? window.BlogSearch.highlightText(post.title, searchQuery)
        : post.title;
      
      const excerpt = searchQuery
        ? window.BlogSearch.highlightText(post.excerpt, searchQuery)
        : post.excerpt;
      
      const tagsHTML = (post.tags || [])
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
      
      return `
        <article class="post-card" style="animation-delay: ${index * 0.05}s">
          <h2 class="post-card-title">
            <a href="post.html?file=${encodeURIComponent(post.file)}">${title}</a>
          </h2>
          <div class="post-card-meta">
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            ${post.category ? `<span class="category">${post.category}</span>` : ''}
          </div>
          <p class="post-card-excerpt">${excerpt}</p>
          ${tagsHTML ? `<div class="post-card-tags">${tagsHTML}</div>` : ''}
        </article>
      `;
    }).join('');
    
    postsListEl.innerHTML = postsHTML;
  }

  /**
   * 태그 필터 렌더링
   */
  function renderTagFilter() {
    if (!tagFilterEl) return;
    
    // 모든 태그 수집
    const tagCounts = {};
    allPosts.forEach(post => {
      (post.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // 태그가 없으면 필터 숨기기
    if (Object.keys(tagCounts).length === 0) {
      tagFilterEl.style.display = 'none';
      return;
    }
    
    // 태그 버튼 생성 (빈도순 정렬)
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
    
    const allBtn = `<button class="tag-btn active" data-tag="">전체</button>`;
    const tagBtns = sortedTags
      .map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`)
      .join('');
    
    tagFilterEl.innerHTML = allBtn + tagBtns;
    
    // 태그 버튼 이벤트 리스너
    tagFilterEl.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', () => handleTagFilter(btn.dataset.tag));
    });
  }

  /**
   * 태그 필터 처리
   */
  function handleTagFilter(tag) {
    activeTag = tag || null;
    
    // 버튼 활성화 상태 업데이트
    tagFilterEl.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });
    
    // 필터링 적용
    applyFilters();
  }

  /**
   * 검색 결과 처리 (search.js에서 호출)
   */
  function handleSearchResults(results, query) {
    currentSearchQuery = query;
    filteredPosts = results;
    
    // 태그 필터도 함께 적용
    if (activeTag) {
      filteredPosts = filteredPosts.filter(post => 
        (post.tags || []).includes(activeTag)
      );
    }
    
    renderPosts(filteredPosts, query);
  }

  /**
   * 모든 필터 적용
   */
  function applyFilters() {
    // 검색 결과 기반
    let results = currentSearchQuery 
      ? window.BlogSearch.performSearch(currentSearchQuery)
      : [...allPosts];
    
    // 태그 필터 적용
    if (activeTag) {
      results = results.filter(post => 
        (post.tags || []).includes(activeTag)
      );
    }
    
    filteredPosts = results;
    renderPosts(filteredPosts, currentSearchQuery);
  }

  /**
   * 날짜 포맷팅
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}. ${month}. ${day}`;
  }

  /**
   * 로딩 상태 표시/숨기기
   */
  function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
  }

  function showNoPosts() {
    if (noPostsEl) noPostsEl.style.display = 'block';
  }

  function hideNoPosts() {
    if (noPostsEl) noPostsEl.style.display = 'none';
  }

  function showError(message) {
    hideLoading();
    if (postsListEl) {
      postsListEl.innerHTML = `
        <div class="error-message">
          <p>⚠️ ${message}</p>
        </div>
      `;
    }
  }

  /**
   * 초기화
   */
  function init() {
    // 메인 페이지에서만 실행
    if (!postsListEl) return;
    
    // 게시글 로드
    loadPosts();
    
    // 검색 초기화
    if (window.BlogSearch) {
      window.BlogSearch.initSearch(handleSearchResults);
    }
  }

  // DOM 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

