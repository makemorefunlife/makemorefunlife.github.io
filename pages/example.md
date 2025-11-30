---
title: '블로그에 오신 것을 환영합니다!'
date: 2025-11-30
tags: ['블로그', 'GitHub Pages', 'Markdown']
category: 'Welcome'
description: '첫 번째 게시글입니다. 블로그 사용법을 알아보세요.'
---

# 안녕하세요! 👋

**makemorefunlife의 블로그**에 오신 것을 환영합니다!

이 블로그는 GitHub Pages를 사용하여 호스팅되는 정적 블로그입니다. 마크다운으로 글을 작성하면 자동으로 웹 페이지로 변환됩니다.

## 블로그 특징

- 📝 **마크다운 기반**: 간편하게 글을 작성할 수 있습니다
- 🌙 **다크/라이트 모드**: 우측 상단 버튼으로 테마 전환
- 🔍 **검색 기능**: 게시글을 쉽게 찾을 수 있습니다
- 🏷️ **태그 필터**: 관심 있는 주제만 모아보기
- 💬 **댓글 시스템**: Giscus로 소통하기

## 마크다운 예시

### 코드 블록

JavaScript 예시:

```javascript
function sayHello(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to my blog, ${name}!`;
}

sayHello('Reader');
```

Python 예시:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 처음 10개의 피보나치 수열
for i in range(10):
    print(fibonacci(i), end=' ')
```

### 인용문

> "The only way to do great work is to love what you do."
> 
> — Steve Jobs

### 목록

순서 있는 목록:

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

순서 없는 목록:

- 사과
- 바나나
- 체리

### 표

| 이름 | 설명 | 링크 |
|------|------|------|
| GitHub | 코드 저장소 | [github.com](https://github.com) |
| Markdown | 마크업 언어 | [문서](https://www.markdownguide.org) |
| Giscus | 댓글 시스템 | [giscus.app](https://giscus.app) |

### 이미지

이미지를 추가하려면 다음과 같이 작성하세요:

```markdown
![대체 텍스트](이미지URL)
```

## 새 글 작성 방법

1. `pages/` 폴더에 새 `.md` 파일을 만듭니다
2. 파일 상단에 Front Matter를 작성합니다:

```yaml
---
title: '게시글 제목'
date: 2025-01-01
tags: ['태그1', '태그2']
category: '카테고리'
description: '게시글 설명'
---
```

3. 마크다운으로 본문을 작성합니다
4. Git으로 커밋하고 푸시하면 자동 배포됩니다!

## 마무리

이제 여러분만의 이야기를 기록해보세요. 질문이나 피드백은 아래 댓글로 남겨주세요! 🚀

---

*읽어주셔서 감사합니다!*

