import { motion } from "framer-motion";
import { Info, Shield, ExternalLink } from "lucide-react";

/** 설정 및 면책 조항 페이지 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-gold text-2xl font-bold">설정</h1>
      </motion.div>

      {/* 앱 정보 */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Info size={18} className="text-gold" />
          <h2 className="text-sm font-semibold text-foreground">앱 정보</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>AI 운세·타로 "오늘의 한 장"</p>
          <p>버전 1.0.3</p>
        </div>
      </div>

      {/* 면책 조항 */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-gold" />
          <h2 className="text-sm font-semibold text-foreground">면책 조항</h2>
        </div>
        <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            본 서비스("오늘의 한 장")는 <strong className="text-foreground">오락 목적으로만</strong>{" "}
            제공됩니다.
          </p>
          <p>
            제공되는 타로 카드 해석은 심리적·영적·의학적·재정적 조언을 구성하지
            않으며, 어떠한 실질적 결정의 근거로 사용되어서는 안 됩니다.
          </p>
          <p>
            본 서비스는 투자, 도박, 건강 진단과 관련된 어떠한 정보도 제공하지
            않습니다. 모든 해석은 일반적이고 암시적인 성격이며, "반드시 일어난다"는
            식의 단정적 표현을 포함하지 않습니다.
          </p>
          <p>
            중요한 결정은 반드시 전문가와 상의하시기 바랍니다.
          </p>
        </div>
      </div>

      {/* 데이터 관리 */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground">데이터 관리</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          모든 데이터는 기기 내(LocalStorage)에만 저장되며, 외부 서버로
          전송되지 않습니다.
        </p>
        <button
          onClick={() => {
            if (confirm("모든 기록을 삭제하시겠습니까?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="mt-3 rounded-lg bg-destructive/10 px-4 py-2 text-xs text-destructive transition-colors hover:bg-destructive/20"
        >
          데이터 초기화
        </button>
      </div>
    </div>
  );
}
