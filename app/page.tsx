'use client';

import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../src/lib/analytics';
import { QRCodeCanvas } from 'qrcode.react';

interface FontOption {
  label: string;
  css: string;
}

interface FormState {
  name: string;
  contactUrl: string;
  textColor: string;
  fontFamily: string;
}

const FONT_OPTIONS: FontOption[] = [
  { label: 'Noto Serif JP', css: "var(--font-noto-serif-jp), 'Noto Serif JP', serif" },
  { label: 'Noto Sans JP', css: "var(--font-noto-sans-jp), 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif" },
  { label: 'さわらび明朝', css: "var(--font-sawarabi-mincho), 'Sawarabi Mincho', 'Hiragino Mincho ProN', serif" },
  { label: 'メイリオ', css: "'Meiryo Web', 'Meiryo', 'Hiragino Kaku Gothic ProN', 'MS PGothic', sans-serif" },
];

const DEFAULT_FORM: FormState = {
  name: '',
  contactUrl: '',
  textColor: '#000000',
  fontFamily: 'Noto Serif JP',
};

const SHEET_WIDTH_MM = 127;
const SHEET_HEIGHT_MM = 89;
const SHEET_MARGIN_MM = 3.5;
const TAG_WIDTH_MM = 30;
const TAG_HEIGHT_MM = 15;
const TAG_TEXT_MAX_WIDTH_MM = 14;
const TAG_NAME_MIN_FONT_MM = 1.1;
const TAG_NAME_MAX_FONT_MM = 4.0;
const ASCII_LOWER_WIDTH_FACTOR = 0.55;
const ASCII_UPPER_WIDTH_FACTOR = 0.7;
const DIGIT_WIDTH_FACTOR = 0.6;
const SPACE_WIDTH_FACTOR = 0.35;
const HALF_WIDTH_KANA_FACTOR = 0.7;

export default function HomePage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const updateForm = useCallback((key: keyof FormState) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let { value } = event.target;

      if (key === 'name') {
        value = value.slice(0, 12);
      }

      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }, []);

  const displayName = form.name.trim();
  const displayContact = form.contactUrl.trim();
  const hasContent = displayName.length > 0 && displayContact.length > 0;

  const safeName = displayName || 'no-name';

  const qrValue = useMemo(() => {
    return displayContact;
  }, [displayContact]);

  const selectedFontCss = useMemo(() => {
    return FONT_OPTIONS.find((option) => option.label === form.fontFamily)?.css ?? FONT_OPTIONS[0]!.css;
  }, [form.fontFamily]);


  const nameFontSizeMm = useMemo(() => {
    if (displayName.length === 0) {
      return TAG_NAME_MAX_FONT_MM;
    }

    const totalWidthUnits = (() => {
      let total = 0;

      for (const char of displayName) {
        const codePoint = char.codePointAt(0) ?? 0;

        if (codePoint === 0x3000) {
          total += 1;
          continue;
        }

        if (/\s/.test(char)) {
          total += SPACE_WIDTH_FACTOR;
          continue;
        }

        if (codePoint >= 0xff61 && codePoint <= 0xff9f) {
          total += HALF_WIDTH_KANA_FACTOR;
          continue;
        }

        if (/\d/.test(char)) {
          total += DIGIT_WIDTH_FACTOR;
          continue;
        }

        if (/[A-Z]/.test(char)) {
          total += ASCII_UPPER_WIDTH_FACTOR;
          continue;
        }

        if (/[a-z]/.test(char)) {
          total += ASCII_LOWER_WIDTH_FACTOR;
          continue;
        }

        if (codePoint <= 0x00ff) {
          total += ASCII_LOWER_WIDTH_FACTOR;
          continue;
        }

        total += 1;
      }

      return total;
    })();

    if (totalWidthUnits === 0) {
      return TAG_NAME_MAX_FONT_MM;
    }

    const computed = Math.min(TAG_NAME_MAX_FONT_MM, TAG_TEXT_MAX_WIDTH_MM / totalWidthUnits);
    return Math.max(TAG_NAME_MIN_FONT_MM, computed);
  }, [displayName]);

  const contentColumns = useMemo(() => {
    return Math.floor((SHEET_WIDTH_MM - SHEET_MARGIN_MM * 2) / TAG_WIDTH_MM);
  }, []);

  const contentRows = useMemo(() => {
    return Math.floor((SHEET_HEIGHT_MM - SHEET_MARGIN_MM * 2) / TAG_HEIGHT_MM);
  }, []);

  const tagCount = contentColumns * contentRows;
  const tags = useMemo(() => Array.from({ length: tagCount }), [tagCount]);

  const handleDownload = useCallback(async () => {
    if (!hasContent) {
      setErrorMessage('先に名前と連絡先URLを入力してください。');
      return;
    }

    trackEvent('download_png_button_click', {
      event_category: 'engagement',
      event_label: safeName,
    });

    const sheetElement = sheetRef.current;

    if (!sheetElement) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      sheetElement.setAttribute('data-exporting', 'true');
      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(sheetElement, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `maigo-tag-${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate PNG', error);
      setErrorMessage('画像の生成に失敗しました。ブラウザを最新化して再試行してください。');
    } finally {
      sheetElement.removeAttribute('data-exporting');
      setIsGenerating(false);
    }
  }, [hasContent, safeName]);

  return (
    <>
      {isGenerating ? (
        <div className="loadingOverlay" role="status" aria-live="polite">
          <div className="spinner" />
          <p className="loadingText">画像を生成中です…</p>
        </div>
      ) : null}
      <main className="page">
      <section className="form">
        <h1 className="title" style={{ whiteSpace: 'nowrap' }}>
          <img src="/title.png" alt="ReturnMeTags!" className="titleImage" />
        </h1>
        <p className="subtitle">迷子タグジェネレーター</p>
        <p className="description">
          お名前と連絡先を入力するだけで、L版サイズの迷子タグシートをブラウザ上で簡単に作成できます。コンビニのネットプリントでシールに印刷すれば、持ち物に貼れる安心タグがすぐ完成します。
        </p>
        <ul className="notes">
          <li>※印刷時はフチ無し印刷推奨</li>
          <li>※タグのサイズは幅30mm x 高さ15mm</li>
        </ul>
        <div className="inputGrid">
          <label className="field">
            <span>名前</span>
            <input
              type="text"
              value={form.name}
              onChange={updateForm('name')}
              placeholder="おなまえ"
              aria-label="名前"
              maxLength={12}
            />
            <small className="fieldNote">※12文字以内で入力してください</small>
          </label>
          <label className="field">
            <span>連絡先URL(SNSなど)</span>
            <input
              type="url"
              value={form.contactUrl}
              onChange={updateForm('contactUrl')}
              placeholder="https://example.com/contact"
              aria-label="連絡先URL(SNSなど)"
            />
          </label>
          <label className="field">
            <span>カラー</span>
            <input
              type="color"
              value={form.textColor}
              onChange={updateForm('textColor')}
              aria-label="カラー"
            />
            <small className="fieldNote">
              明度の高い色はQRコードが読み取れない場合があります。印刷後に読み取りテストを行うことをおすすめします。
            </small>
          </label>
          <label className="field">
            <span>文字フォント</span>
            <select
              value={form.fontFamily}
              onChange={updateForm('fontFamily')}
              aria-label="文字フォント"
            >
              {FONT_OPTIONS.map((option) => (
                <option value={option.label} key={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="placeholderSpace" aria-hidden="true" />
        {errorMessage ? <p role="alert" className="error">{errorMessage}</p> : null}
      </section>

      <section className="previewSection">
        <h2 className="previewHeading">Preview!</h2>
        <div className="previewWrapper">
          {hasContent ? (
            <div className="sheet" ref={sheetRef}>
                      <div
                className="tagGrid"
                style={{ gridTemplateColumns: `repeat(${contentColumns}, ${TAG_WIDTH_MM}mm)` }}
              >
                {tags.map((_, index) => (
                  <div className="tag" data-testid="tag-item" key={index}>
                    <div
                      className="tagContent"
                      style={{
                        color: form.textColor,
                        fontFamily: selectedFontCss,
                      }}
                    >
                      <div className="tagBody">
                        <div className="tagText">
                          <p
                            className="tagName"
                            style={{ fontSize: `${nameFontSizeMm}mm` }}
                          >
                            {displayName}
                          </p>
                          <p className="tagLabel">連絡先はこちら</p>
                          <p className="tagVia">via #ReturnMeTags!</p>
                        </div>
                        <div className="tagQr" aria-hidden="true">
                          <QRCodeCanvas
                            value={qrValue}
                            size={90}
                            bgColor="#ffffff"
                            fgColor={form.textColor || '#111827'}
                            includeMargin={false}
                            level="M"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="emptyPreview" role="presentation">
              <p>名前と連絡先URLを入力するとここにプレビューが表示されます。</p>
            </div>
          )}
        </div>
        <div className="previewActions">
          <button
            type="button"
            onClick={handleDownload}
            className="downloadButton"
            disabled={isGenerating}
          >
            {isGenerating ? '生成中…' : 'PNGをダウンロード'}
          </button>
          <a
            className="shareButton"
            href="https://twitter.com/share?url=https%3A%2F%2Freturnmetags.raitehu.com&text=ReturnMeTags!%E3%81%A7%E8%BF%B7%E5%AD%90%E3%82%BF%E3%82%B0%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%9F%E3%82%88%EF%BC%81&hashtags=ReturnMeTags"
            target="_blank"
            rel="noreferrer"
          >
            Xでシェア
          </a>
          <p className="privacyNote">入力した情報および生成された画像データは外部へ送信されません。すべてブラウザ内で処理されます。</p>
          <div className="netprintLinks">
            <a
              className="netprintButton"
              href="https://networkprint.ne.jp/sharp_netprint/ja/top.aspx"
              target="_blank"
              rel="noreferrer"
            >
              FamilyMart/ローソン/ミニストップ/ポプラのネップリ登録はこちら
            </a>
            <a
              className="netprintButton"
              href="https://www.sej.co.jp/services/multicopy/print.html"
              target="_blank"
              rel="noreferrer"
            >
              セブンイレブンのネップリ登録はこちら
            </a>
          </div>
        </div>
      </section>
    </main>
      <footer className="pageFooter">
        <p>開発および各種権利は RaitehuV に帰属します。</p>
        <p>All development and associated rights belong to RaitehuV.</p>
      </footer>
    </>
  );
}
