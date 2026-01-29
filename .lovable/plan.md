

# خطة إصلاح عرض محتوى EPUB في صفحة القارئ

## المشكلة الحالية
صفحة القارئ تعرض محتوى HTML المستخرج من EPUB كنص عادي (تظهر العلامات `<div>`, `<p>`, `<em>` كنص) بدلاً من تحويلها إلى تنسيق HTML فعلي.

## الحل المقترح

### 1. تحديث Reader.tsx لعرض HTML بشكل صحيح

**التغييرات المطلوبة:**

- استبدال عرض الفقرات النصية بعنصر `dangerouslySetInnerHTML` لعرض HTML الفعلي
- إضافة تنسيقات CSS مخصصة لمحتوى EPUB
- الحفاظ على التنسيقات الأصلية (italic, bold, headers, etc.)

**الوضع العمودي (Vertical):**
```jsx
// بدلاً من:
{paragraphs.map((para, index) => (
  <p key={index}>{para}</p>
))}

// سيكون:
<div 
  className="chapter-content prose prose-invert"
  dangerouslySetInnerHTML={{ __html: content }}
/>
```

**الوضع الأفقي (Horizontal):**
- تقسيم المحتوى بناءً على عناصر HTML بدلاً من `\n\n`
- استخدام DOMParser لفصل الفقرات بشكل صحيح

### 2. إضافة تنسيقات CSS للمحتوى

إضافة styles في `index.css` لدعم:
- تنسيق الفقرات والعناوين
- دعم النص المائل والعريض
- تباعد مناسب بين العناصر
- دعم الصور المضمنة

```css
.chapter-content p { margin-bottom: 1rem; line-height: 1.8; }
.chapter-content em, .chapter-content i { font-style: italic; }
.chapter-content .chapter-title { font-size: 1.5rem; font-weight: bold; }
```

### 3. تحسين تقسيم الصفحات للوضع الأفقي

- استخراج عناصر `<p>` من HTML
- عرض كل فقرة في صفحة منفصلة مع الحفاظ على التنسيق

---

## التفاصيل التقنية

### الملفات المتأثرة:
1. `src/pages/Reader.tsx` - تحديث منطق العرض
2. `src/index.css` - إضافة تنسيقات المحتوى

### تغييرات Reader.tsx:

```typescript
// إضافة دالة لاستخراج الفقرات من HTML
const extractParagraphs = (html: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = doc.querySelectorAll('p');
  return Array.from(paragraphs).map(p => p.outerHTML);
};

// الوضع العمودي - عرض HTML كامل
<div 
  className="chapter-content"
  dangerouslySetInnerHTML={{ __html: content }}
/>

// الوضع الأفقي - عرض فقرة واحدة
<div 
  className="chapter-content"
  dangerouslySetInnerHTML={{ __html: pages[currentPage] }}
/>
```

### إضافات CSS:

```css
.chapter-content {
  @apply text-foreground/90 leading-relaxed;
}

.chapter-content p {
  @apply mb-4 text-sm leading-7;
}

.chapter-content em,
.chapter-content i {
  @apply italic;
}

.chapter-content .chapter-title {
  @apply text-xl font-bold mb-6 text-center;
}

.chapter-content .chapter-ugc {
  @apply space-y-4;
}
```

## النتيجة المتوقعة
- عرض المحتوى بتنسيق HTML صحيح
- ظهور النص المائل والعريض بشكل طبيعي
- الحفاظ على هيكل الفصل الأصلي
- دعم الصور المضمنة

