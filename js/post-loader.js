/**
 * Post Loader Module
 * 마크다운 게시글 로딩 및 파싱
 */

(function() {
  'use strict';

  // DOM 요소
  const postTitleEl = document.getElementById('post-title');
  const postDateEl = document.getElementById('post-date');
  const postCategoryEl = document.getElementById('post-category');
  const postTagsEl = document.getElementById('post-tags');
  const postContentEl = document.getElementById('post-content');
  const loadingEl = document.getElementById('loading');
  const giscusContainerEl = document.getElementById('giscus-container');

  /**
   * URL에서 파일명 추출
   */
  function getFileFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  /**
   * 마크다운 파일 로드 및 파싱
   */
  async function loadPost() {
    const filename = getFileFromURL();
    
    if (!filename) {
      showError('게시글을 찾을 수 없습니다.');
      return;
    }

    try {
      const response = await fetch(`pages/${filename}`);
      
      if (!response.ok) {
        throw new Error('Post not found');
      }
      
      let content = await response.text();
      
      // UTF-8 BOM 제거 (Windows 호환)
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      
      // Front Matter 파싱
      const { metadata, body } = parseFrontMatter(content);
      
      // 메타데이터 렌더링
      renderMetadata(metadata, filename);
      
      // 마크다운 렌더링
      renderMarkdown(body);
      
      // Giscus 로드
      loadGiscus();
      
    } catch (error) {
      console.error('Error loading post:', error);
      showError('게시글을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Front Matter 파싱
   */
  function parseFrontMatter(content) {
    const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      return { metadata: {}, body: content };
    }
    
    const frontMatterLines = match[1].split(/\r?\n/);
    const metadata = {};
    
    frontMatterLines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // 따옴표 제거
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value.slice(1, -1)
              .split(',')
              .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }
        
        metadata[key] = value;
      }
    });
    
    return { metadata, body: match[2] };
  }

  /**
   * 메타데이터 렌더링
   */
  function renderMetadata(metadata, filename) {
    // 제목
    const title = metadata.title || filename.replace('.md', '');
    if (postTitleEl) postTitleEl.textContent = title;
    document.title = `${title} - makemorefunlife's Blog`;
    
    // 날짜
    if (postDateEl && metadata.date) {
      postDateEl.textContent = formatDate(metadata.date);
      postDateEl.setAttribute('datetime', metadata.date);
    }
    
    // 카테고리
    if (postCategoryEl) {
      if (metadata.category) {
        postCategoryEl.textContent = metadata.category;
        postCategoryEl.style.display = 'inline-block';
      } else {
        postCategoryEl.style.display = 'none';
      }
    }
    
    // 태그
    if (postTagsEl && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      const tagsHTML = metadata.tags
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
      postTagsEl.innerHTML = tagsHTML;
    }
  }

  /**
   * 마크다운 렌더링
   */
  function renderMarkdown(markdown) {
    if (!postContentEl) return;
    
    // marked.js 설정
    if (window.marked) {
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
        highlight: function(code, lang) {
          if (window.Prism && lang && Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          }
          return code;
        }
      });
      
      // HTML로 변환
      const html = marked.parse(markdown);
      postContentEl.innerHTML = html;
      
      // Prism.js 코드 하이라이팅 재적용
      if (window.Prism) {
        Prism.highlightAllUnder(postContentEl);
      }
      
      // 외부 링크에 target="_blank" 추가
      postContentEl.querySelectorAll('a').forEach(link => {
        if (link.hostname !== window.location.hostname) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
      
    } else {
      // marked.js가 없으면 원본 표시
      postContentEl.innerHTML = `<pre>${escapeHtml(markdown)}</pre>`;
    }
    
    hideLoading();
  }

  /**
   * HTML 이스케이프
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
   * Giscus 댓글 시스템 로드
   */
  function loadGiscus() {
    if (!giscusContainerEl) return;
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'makemorefunlife/makemorefunlife.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // TODO: 실제 값으로 교체 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // TODO: 실제 값으로 교체 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    
    // 현재 테마에 맞춰 Giscus 테마 설정
    const currentTheme = document.documentElement.getAttribute('data-theme');
    script.setAttribute('data-theme', currentTheme === 'dark' ? 'dark' : 'light');
    
    giscusContainerEl.appendChild(script);
  }

  /**
   * 로딩 숨기기
   */
  function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
  }

  /**
   * 에러 표시
   */
  function showError(message) {
    hideLoading();
    if (postContentEl) {
      postContentEl.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
          <p style="font-size: 3rem; margin-bottom: 1rem;">😔</p>
          <p>${message}</p>
          <p style="margin-top: 1rem;">
            <a href="index.html">← 목록으로 돌아가기</a>
          </p>
        </div>
      `;
    }
  }

  /**
   * 초기화
   */
  function init() {
    // 게시글 페이지에서만 실행
    if (!postContentEl) return;
    
    loadPost();
  }

  // DOM 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

