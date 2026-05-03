import { Paragraph } from '@toss/tds-mobile';
import { spacingPx, radiusPx, layoutPx } from '@/design/tokens';
import { CONSULT_CATEGORIES } from '@/data/consultCategories';
import type { CategoryId } from '@/types/consult';

interface CategoryPickerProps {
  onSelect: (id: CategoryId) => void;
}

export default function CategoryPicker({ onSelect }: CategoryPickerProps) {
  return (
    <div
      role="list"
      aria-label="타로 상담 카테고리"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacingPx('xs'),
        width: '100%',
      }}
    >
      {CONSULT_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="listitem"
          aria-label={`${cat.label} 카테고리 선택`}
          onClick={() => onSelect(cat.id)}
          className="glass-card consult-category-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacingPx('md'),
            width: '100%',
            padding: spacingPx('lg'),
            borderRadius: radiusPx('xl'),
            minHeight: layoutPx('touchTargetMin'),
            textAlign: 'left',
          }}
        >
          <span aria-hidden style={{ fontSize: spacingPx('xl'), lineHeight: 1 }}>
            {cat.emoji}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <Paragraph typography="t6" style={{ margin: 0 }}>
              <Paragraph.Text fontWeight="bold">{cat.label}</Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t7" style={{ margin: `${spacingPx('xxs')} 0 0` }}>
              <Paragraph.Text color="gray">{cat.hint}</Paragraph.Text>
            </Paragraph>
          </span>
          <span aria-hidden style={{ opacity: 0.5 }}>›</span>
        </button>
      ))}
    </div>
  );
}
