import { describe, it, expect } from 'vitest';
import App from '@/App';

/**
 * 페이지 스모크: App 컴포넌트가 정상 로드되는지 확인.
 * 실제 화면 렌더는 TDS/Apps in Toss 브리지가 필요하므로
 * 수동 검증은 README "테스트 및 검증" 참고.
 */
describe('페이지 스모크', () => {
  it('App 컴포넌트가 존재하고 함수(컴포넌트)이다', () => {
    expect(typeof App).toBe('function');
    expect(App).toBeDefined();
  });
});
