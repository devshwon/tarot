import type { TarotCard } from '@/types/tarot';
import { minorArcanaCards } from './tarotDataMinor';

/**
 * 타로 카드 데이터셋.
 * - 일반적인 타로 덱: 메이저 아르카나 22장(0~21) + 마이너 아르카나 56장 = 총 78장.
 * - 카피 가이드: 오락 목적, 단정·투자·건강·도박 유도 표현 금지.
 * - shortReading / detailedReading: 암시·가능성 톤 유지(~할 수 있습니다, ~해 보세요).
 * - advice: 한 문장 권장, 가독성 위해 60자 이내.
 * - imageUrl: 메이저는 로컬 /tarot/NN.jpg 사용 (public/tarot). 마이너는 emoji 표시.
 */
export const MAX_ADVICE_LENGTH = 60;

/** 메이저 아르카나 장수 (RWS 0~21) */
export const MAJOR_ARCANA_COUNT = 22;

/** 전체 덱 78장 */
export const TAROT_DECK_SIZE = 78;

const tarotImages: string[] = [
  '/tarot/00.jpg',
  '/tarot/01.jpg',
  '/tarot/02.jpg',
  '/tarot/03.jpg',
  '/tarot/04.jpg',
  '/tarot/05.jpg',
  '/tarot/06.jpg',
  '/tarot/07.jpg',
  '/tarot/08.jpg',
  '/tarot/09.jpg',
  '/tarot/10.jpg',
  '/tarot/11.jpg',
  '/tarot/12.jpg',
  '/tarot/13.jpg',
  '/tarot/14.jpg',
  '/tarot/15.jpg',
  '/tarot/16.jpg',
  '/tarot/17.jpg',
  '/tarot/18.jpg',
  '/tarot/19.jpg',
  '/tarot/20.jpg',
  '/tarot/21.jpg',
];

const majorArcanaCards: TarotCard[] = [
  { id: 0, name: "The Fool", nameKo: "바보", emoji: "🃏", imageUrl: tarotImages[0], keywords: ["새로운 시작", "모험", "순수"], shortReading: "새로운 시작의 에너지가 느껴지는 하루입니다. 가벼운 마음으로 첫 발을 내딛어 보세요.", detailedReading: "오늘은 순수한 마음이 오히려 힘이 될 수 있는 날입니다. 직관을 따라 움직여 보는 것도 좋겠습니다. 새로운 만남이나 기회가 다가올 수 있으니 열린 마음을 유지해 보세요. 지나친 무모함만은 조심해 보세요.", advice: "오늘은 '시작'에 집중해 보세요. 작은 것이라도 좋습니다.", luckyColor: "노란색", luckyNumber: 0 },
  { id: 1, name: "The Magician", nameKo: "마법사", emoji: "✨", imageUrl: tarotImages[1], keywords: ["창조력", "의지", "집중"], shortReading: "당신 안에 있는 능력을 발휘할 수 있는 날입니다. 자신감을 가져 보세요.", detailedReading: "마법사 카드는 재능과 자원을 활용할 수 있는 시기를 암시합니다. 무언가를 만들어 내거나 기획하는 일에 좋은 에너지가 흐를 수 있습니다. 중요한 대화가 있다면 오늘 시도해 보는 것도 좋겠습니다.", advice: "집중하면 좋은 결과를 만들어 낼 수 있을지도 모릅니다.", luckyColor: "빨간색", luckyNumber: 1 },
  { id: 2, name: "The High Priestess", nameKo: "여사제", emoji: "🌙", imageUrl: tarotImages[2], keywords: ["직관", "내면", "신비"], shortReading: "조용히 내면의 목소리에 귀 기울여 보세요. 답은 이미 안에 있을 수 있습니다.", detailedReading: "여사제 카드는 깊은 직관과 내면의 지혜를 상징합니다. 오늘은 자신의 느낌을 더 신뢰해 보는 것이 좋겠습니다. 꿈이나 갑자기 떠오르는 생각에 주의를 기울여 보세요. 조용한 시간을 갖는 것이 도움이 될 수 있습니다.", advice: "명상이나 조용한 산책으로 마음을 가라앉혀 보세요.", luckyColor: "남색", luckyNumber: 2 },
  { id: 3, name: "The Empress", nameKo: "여황제", emoji: "🌸", imageUrl: tarotImages[3], keywords: ["풍요", "아름다움", "사랑"], shortReading: "따뜻하고 풍요로운 에너지가 감싸는 하루가 될 수 있습니다.", detailedReading: "여황제는 풍요와 사랑의 에너지를 나타냅니다. 주변 사람들과의 관계에서 따뜻함을 느낄 수 있는 날일 수 있습니다. 자신을 위한 작은 즐거움을 허락해 보세요. 창작 활동에도 좋은 에너지가 흐를 수 있습니다.", advice: "자신과 주변 사람들에게 따뜻한 말 한마디를 건네 보세요.", luckyColor: "분홍색", luckyNumber: 3 },
  { id: 4, name: "The Emperor", nameKo: "황제", emoji: "👑", imageUrl: tarotImages[4], keywords: ["안정", "리더십", "구조"], shortReading: "체계적으로 접근하면 좋은 결과를 기대해 볼 수 있는 날입니다.", detailedReading: "황제 카드는 질서와 구조의 중요성을 강조합니다. 계획을 세우고 체계적으로 일을 진행하면 효율적인 하루를 보낼 수 있을 수 있습니다. 리더십이 필요한 상황에서 당신의 능력이 빛날 수 있습니다.", advice: "오늘의 할 일 목록을 만들어 하나씩 해결해 보세요.", luckyColor: "금색", luckyNumber: 4 },
  { id: 5, name: "The Lovers", nameKo: "연인", emoji: "💕", imageUrl: tarotImages[5], keywords: ["선택", "조화", "사랑"], shortReading: "중요한 선택의 순간이 올 수 있습니다. 마음의 소리를 따라가 보세요.", detailedReading: "연인 카드는 중요한 선택과 가치관의 조화를 의미합니다. 어떤 결정을 내려야 한다면 마음이 이끄는 방향을 고려해 보세요. 관계에서 진솔한 소통이 도움이 될 수 있습니다.", advice: "진심을 담아 대화해 보세요.", luckyColor: "주황색", luckyNumber: 6 },
  { id: 6, name: "The Chariot", nameKo: "전차", emoji: "🏎️", imageUrl: tarotImages[6], keywords: ["전진", "의지력", "승리"], shortReading: "강한 의지로 앞으로 나아갈 수 있는 하루입니다. 멈추지 마세요.", detailedReading: "전차 카드는 결단력과 추진력을 상징합니다. 목표를 향해 나아가는 것이 좋겠습니다. 어려움이 있더라도 포기하지 않으면 좋은 방향으로 흘러갈 가능성이 있습니다. 지나친 고집은 부딪힘을 만들 수 있으니 유연함도 가져 보세요.", advice: "목표를 하나 정하고 오늘 하루 집중해 보세요.", luckyColor: "파란색", luckyNumber: 7 },
  { id: 7, name: "Strength", nameKo: "힘", emoji: "🦁", imageUrl: tarotImages[7], keywords: ["용기", "인내", "내면의 힘"], shortReading: "부드러운 강인함이 필요한 날입니다. 당신은 충분히 강합니다.", detailedReading: "힘 카드는 내면의 용기와 인내를 나타냅니다. 어려운 상황이 닥치더라도 조용하고 차분하게 대처하면 좋은 결과를 기대해 볼 수 있습니다. 감정을 억누르기보다 부드럽게 받아들이는 것이 좋겠습니다.", advice: "힘든 순간에도 깊은 호흡으로 마음을 다잡아 보세요.", luckyColor: "초록색", luckyNumber: 8 },
  { id: 8, name: "The Wheel of Fortune", nameKo: "운명의 수레바퀴", emoji: "🎡", imageUrl: tarotImages[8], keywords: ["변화", "순환", "행운"], shortReading: "변화의 바람이 불어올 수 있는 날입니다. 흐름에 맡겨 보세요.", detailedReading: "운명의 수레바퀴는 삶의 순환과 변화를 상징합니다. 예상치 못한 변화가 생길 수 있지만 나쁜 것만은 아닐 수 있습니다. 새로운 기회가 찾아올 수도 있으니 유연하게 받아들여 보세요.", advice: "변화를 기회로 바라보는 시선을 가져 보세요.", luckyColor: "보라색", luckyNumber: 10 },
  { id: 9, name: "The Star", nameKo: "별", emoji: "⭐", imageUrl: tarotImages[9], keywords: ["희망", "영감", "치유"], shortReading: "희망의 빛이 비추는 하루입니다. 좋은 일이 다가오고 있을지도 모릅니다.", detailedReading: "별 카드는 고난 후에 찾아오는 평화와 희망을 의미합니다. 최근 힘든 시간을 보냈다면 서서히 회복의 에너지를 느낄 수 있을 수 있습니다. 영감이 풍부한 날이니 창작이나 새 아이디어를 메모해 두어도 좋겠습니다.", advice: "밤하늘의 별을 바라보며 소원을 빌어 보세요.", luckyColor: "하늘색", luckyNumber: 17 },
  { id: 10, name: "The Moon", nameKo: "달", emoji: "🌕", imageUrl: tarotImages[10], keywords: ["환상", "불안", "잠재의식"], shortReading: "불확실한 감정이 느껴질 수 있습니다. 서두르지 말고 기다려 보세요.", detailedReading: "달 카드는 불안이나 혼란을 나타내기도 하고, 깊은 감성과 창의력을 암시하기도 합니다. 모든 것이 명확하게 보이지 않을 수 있지만 자연스러운 과정일 수 있습니다. 중요한 결정은 조금 미루고 감정을 충분히 느낀 뒤 행동해 보세요.", advice: "불안할 때는 일기를 쓰거나 감정을 정리해 보세요.", luckyColor: "은색", luckyNumber: 18 },
  { id: 11, name: "The Sun", nameKo: "태양", emoji: "☀️", imageUrl: tarotImages[11], keywords: ["기쁨", "성공", "활력"], shortReading: "밝고 활기찬 에너지가 넘치는 날입니다. 자신감을 가지세요.", detailedReading: "태양 카드는 긍정적인 에너지를 상징합니다. 오늘은 밝은 에너지와 함께 좋은 소식이 찾아올 수 있습니다. 사람들과의 교류가 즐겁고 하는 일마다 순조로울 가능성이 있습니다. 이 기운을 주변과 나눠 보세요.", advice: "오늘의 좋은 기운을 소중한 사람들과 함께하세요.", luckyColor: "노란색", luckyNumber: 19 },
  // 메이저 아르카나 나머지 10장 (RWS 5, 9, 11~16, 20, 21)
  { id: 12, name: "The Hierophant", nameKo: "교황", emoji: "📿", imageUrl: tarotImages[12], keywords: ["전통", "가르침", "영성"], shortReading: "믿음이나 관습에 귀 기울여 보는 하루가 될 수 있습니다.", detailedReading: "교황 카드는 전통과 지혜, 가르침을 상징합니다. 오늘은 믿는 것에 따라 행동해 보거나, 경험 있는 사람의 말에 귀 기울여 보는 것도 좋겠습니다. 새로운 규칙이나 관습을 받아들이는 데 유연해질 수 있는 날일 수 있습니다.", advice: "오늘은 배움과 나눔에 마음을 열어 보세요.", luckyColor: "남색", luckyNumber: 5 },
  { id: 13, name: "The Hermit", nameKo: "은둔자", emoji: "🕯️", imageUrl: tarotImages[13], keywords: ["성찰", "고독", "내면"], shortReading: "조용히 자신만의 시간을 갖는 것이 도움이 될 수 있는 날입니다.", detailedReading: "은둔자 카드는 성찰과 내면의 목소리를 상징합니다. 바쁘게 움직이기보다 잠시 멈추고 생각해 보는 것이 좋겠습니다. 혼자만의 시간이 답을 찾는 데 도움이 될 수 있습니다.", advice: "오늘은 조용한 시간을 조금이라도 가져 보세요.", luckyColor: "회색", luckyNumber: 9 },
  { id: 14, name: "Justice", nameKo: "정의", emoji: "⚖️", imageUrl: tarotImages[14], keywords: ["균형", "공정", "결과"], shortReading: "공정하게 판단하고 행동해 보는 하루가 될 수 있습니다.", detailedReading: "정의 카드는 균형과 공정함, 결과를 상징합니다. 중요한 결정이 있다면 감정보다 사실을 살펴보는 것이 도움이 될 수 있습니다. 올바른 선택을 하려는 마음이 빛날 수 있는 날입니다.", advice: "한발 물러서 상황을 객관적으로 바라보세요.", luckyColor: "녹색", luckyNumber: 11 },
  { id: 15, name: "The Hanged Man", nameKo: "매달린 사람", emoji: "🙃", imageUrl: tarotImages[15], keywords: ["대기", "관점 전환", "포기"], shortReading: "잠시 멈추고 다른 시각으로 바라보는 것이 도움이 될 수 있습니다.", detailedReading: "매달린 사람 카드는 대기와 관점의 전환을 상징합니다. 서두르지 않고 기다리는 것이 나을 수 있는 날입니다. 익숙한 방식을 내려놓으면 새로운 생각이 떠오를 수도 있습니다.", advice: "오늘은 '기다림'도 하나의 선택이 될 수 있습니다.", luckyColor: "남색", luckyNumber: 12 },
  { id: 16, name: "Death", nameKo: "죽음", emoji: "🦋", imageUrl: tarotImages[16], keywords: ["끝과 시작", "변화", "새로운 단계"], shortReading: "무언가가 끝나고 새로운 것이 시작되는 전환의 에너지가 느껴질 수 있습니다.", detailedReading: "죽음 카드는 끝과 새 시작, 변화를 상징합니다. 두려운 것이 아니라 과거를 정리하고 다음 단계로 나아가는 에너지로 볼 수 있습니다. 작은 습관이나 생각을 바꿔 보는 것도 좋겠습니다.", advice: "필요한 것은 과감히 정리하고 새로움을 받아들이세요.", luckyColor: "검정", luckyNumber: 13 },
  { id: 17, name: "Temperance", nameKo: "절제", emoji: "⚗️", imageUrl: tarotImages[17], keywords: ["조화", "인내", "균형"], shortReading: "적당함과 균형을 찾는 하루가 될 수 있습니다.", detailedReading: "절제 카드는 조화와 인내, 균형을 상징합니다. 지나침 없이 적당한 선에서 행동해 보는 것이 좋겠습니다. 감정이나 일정 모두 과한 부분을 줄이면 안정을 찾을 수 있을 수 있습니다.", advice: "오늘은 '적당히'를 키워드로 삼아 보세요.", luckyColor: "하늘색", luckyNumber: 14 },
  { id: 18, name: "The Devil", nameKo: "악마", emoji: "😈", imageUrl: tarotImages[18], keywords: ["유혹", "집착", "해방"], shortReading: "무언가에 묶여 있다고 느껴질 수 있습니다. 한걸음 떨어져 보세요.", detailedReading: "악마 카드는 유혹이나 집착, 그리고 그로부터의 해방을 상징합니다. 습관이나 생각에 갇혀 있다고 느낀다면 그걸 인정하는 것만으로도 조금 풀릴 수 있습니다. 선택은 언제나 당신에게 있습니다.", advice: "당신을 묶고 있다고 느껴지는 것을 하나만 적어 보세요.", luckyColor: "검정", luckyNumber: 15 },
  { id: 19, name: "The Tower", nameKo: "탑", emoji: "🏰", imageUrl: tarotImages[19], keywords: ["변화", "깨달음", "재구축"], shortReading: "예상치 못한 변화가 와도 당황하지 마세요. 새로 세울 수 있습니다.", detailedReading: "탑 카드는 갑작스러운 변화나 깨달음을 상징합니다. 무너진 것처럼 보여도 더 나은 것을 만들 기회일 수 있습니다. 지금은 불안해도 시간이 지나면 의미가 보일 수 있습니다.", advice: "변화 뒤에는 새로운 시작이 올 수 있습니다.", luckyColor: "회색", luckyNumber: 16 },
  { id: 20, name: "Judgement", nameKo: "심판", emoji: "📯", imageUrl: tarotImages[20], keywords: ["부활", "결정", "깨달음"], shortReading: "과거를 돌아보고 다음을 결심해 보는 하루가 될 수 있습니다.", detailedReading: "심판 카드는 부활, 결단, 깨달음을 상징합니다. 지금까지의 경험을 정리하고 무엇을 바꿀지 결정해 보는 것이 좋겠습니다. 용서나 마무리가 필요한 일이 있다면 오늘 다져 보세요.", advice: "한 가지 결심을 정해 오늘 실행해 보세요.", luckyColor: "보라색", luckyNumber: 20 },
  { id: 21, name: "The World", nameKo: "세계", emoji: "🌍", imageUrl: tarotImages[21], keywords: ["완성", "성취", "순환"], shortReading: "한 단계가 마무리되는 느낌이 들 수 있습니다. 다음 장을 준비해 보세요.", detailedReading: "세계 카드는 완성과 성취, 순환을 상징합니다. 어떤 일이 마무리되는 에너지가 있을 수 있고, 그동안의 노력이 결실을 맺는 느낌이 들 수도 있습니다. 다음 목표를 가볍게 생각해 보는 것도 좋겠습니다.", advice: "오늘 하루를 마무리하며 작은 성취를 축하해 보세요.", luckyColor: "금색", luckyNumber: 21 },
];

export const tarotCards: TarotCard[] = [...majorArcanaCards, ...minorArcanaCards];
