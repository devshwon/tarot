/**
 * 페이지 상태 모델 (P0-02).
 * 모든 주요 페이지는 이 네 가지 중 하나로 명시 분기한다.
 */
export type PageState = 'loading' | 'empty' | 'error' | 'success';
