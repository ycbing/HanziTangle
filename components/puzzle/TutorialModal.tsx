"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "hanzi-tangle-tutorial-v1";

export default function TutorialModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-800">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl font-black text-white shadow-lg">
            字
          </div>
          <h2 className="mt-3 text-2xl font-extrabold">欢迎来到「字缠」！</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            把拆散的偏旁部件，拼回正确的汉字。
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-teal-200 to-emerald-300 text-xl font-bold text-stone-800 dark:from-teal-500/70 dark:to-emerald-600/70 dark:text-white">
              清
            </div>
            <div className="text-sm">
              <b>汉字 = 部件拼成</b>
              <br />
              比如「清」= <b>氵 + 青</b>。「氵」是「水」的变体——这些部件砖块就是你的拼图。
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-stone-200 text-lg dark:bg-white/10">
              🖐
            </div>
            <div className="text-sm">
              <b>点或拖</b>：把砖块放进格子。左右两半各放一个部件，齐了自动成字变绿。
              <br />
              <span className="text-stone-500 dark:text-stone-400">
                选中砖块后，能放的位置会亮绿提示。
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-stone-200 text-lg dark:bg-white/10">
              ?
            </div>
            <div className="text-sm">
              <b>线索是答案</b>：右边会提示「河里流的水（2字）」。卡住了点 <b>!</b> 自动揭示（每局 3 次）。
            </div>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-bold text-white shadow-lg hover:opacity-90"
        >
          开始拼字！🧩
        </button>
      </div>
    </div>
  );
}