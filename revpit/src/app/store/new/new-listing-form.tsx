'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createListing, uploadListingImage } from '../actions';
import type { ListingState } from '../actions';
import styles from './new.module.css';

// ─── Submit button ─────────────────────────────────────────────────────────────

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.submitBtn}>
      {pending ? 'SUBMITTING...' : 'SUBMIT LISTING FOR REVIEW'}
    </button>
  );
}

// ─── Image uploader ────────────────────────────────────────────────────────────

function ImageUploader({
  urls,
  onAdd,
  onRemove,
}: {
  urls: string[];
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 5 - urls.length;
    if (remaining <= 0) { setUploadError('Maximum 5 images allowed.'); return; }

    setUploading(true);
    setUploadError(null);

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const fd = new FormData();
      fd.append('file', files[i]);
      const result = await uploadListingImage(fd);
      if (result.error) { setUploadError(result.error); break; }
      if (result.url)   onAdd(result.url);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div>
      {urls.length < 5 && (
        <div className={styles.uploadZone}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className={styles.uploadInput}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="26" height="26" rx="2" stroke="#504F4B" strokeWidth="1.4" strokeDasharray="4 2" />
            <path d="M14 8v12M8 14h12" stroke="#504F4B" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.1em', color: '#898882' }}>
            {uploading ? 'UPLOADING...' : 'CLICK OR DROP TO ADD PHOTOS'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#504F4B', letterSpacing: '0.06em' }}>
            JPEG · PNG · WEBP · MAX 5 MB · UP TO 5 IMAGES
          </span>
        </div>
      )}

      {uploadError && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#FF4444', marginTop: 6 }}>
          {uploadError}
        </p>
      )}

      {urls.length > 0 && (
        <div className={styles.thumbGrid}>
          {urls.map((url) => (
            <div key={url} className={styles.thumbWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="listing" className={styles.thumb} />
              <button
                type="button"
                className={styles.thumbRemove}
                onClick={() => onRemove(url)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────────

const initial: ListingState = { error: null };

export function NewListingForm() {
  const [state, action] = useActionState(createListing, initial);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isExclusive, setIsExclusive] = useState(false);

  // Focus first error field
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state.error]);

  function addImage(url: string) {
    setImageUrls((prev) => [...prev, url].slice(0, 5));
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Corner notch accent */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.4 }}>
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path d="M0 0L21 0L21 21" stroke="#C8FF00" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <form action={action}>
          {/* Hidden: image URLs + exclusive */}
          <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
          <input type="hidden" name="is_exclusive" value={String(isExclusive)} />

          {/* Title */}
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={80}
              required
              placeholder="e.g. OEM+ front splitter, REVPIT hoodie XL..."
              className={styles.input}
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              maxLength={1000}
              placeholder="Condition details, fitment notes, shipping info..."
              className={styles.textarea}
            />
          </div>

          {/* Category + Condition */}
          <div className={styles.row}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label htmlFor="category" className={styles.label}>
                Category <span className={styles.required}>*</span>
              </label>
              <select id="category" name="category" required className={styles.select}>
                <option value="merch">Merch</option>
                <option value="car_parts">Car Parts</option>
              </select>
            </div>

            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label htmlFor="condition" className={styles.label}>
                Condition <span className={styles.required}>*</span>
              </label>
              <select id="condition" name="condition" required className={styles.select}>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          {/* Spacer between rows */}
          <div style={{ marginBottom: 22 }} />

          {/* Price */}
          <div className={styles.field}>
            <label htmlFor="price" className={styles.label}>
              Price (USD) <span className={styles.required}>*</span>
            </label>
            <div className={styles.priceWrap}>
              <span className={styles.pricePrefix}>$</span>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                max="999999"
                step="0.01"
                required
                placeholder="0.00"
                className={`${styles.input} ${styles.priceInput}`}
              />
            </div>
          </div>

          {/* Images */}
          <div className={styles.field}>
            <span className={styles.label}>Photos (up to 5)</span>
            <ImageUploader urls={imageUrls} onAdd={addImage} onRemove={removeImage} />
          </div>

          {/* Exclusive toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isExclusive}
            onClick={() => setIsExclusive((v) => !v)}
            className={`${styles.toggleRow} ${isExclusive ? styles.toggleActive : ''}`}
          >
            <div className={styles.toggle}>
              <div className={styles.toggleKnob} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: isExclusive ? '#C8FF00' : '#898882', margin: 0 }}>
                MEMBERS ONLY
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#504F4B', margin: '2px 0 0' }}>
                Visible only to club members and subscribed accounts
              </p>
            </div>
          </button>

          {/* Payment placeholder notice */}
          <div
            style={{
              padding:      '12px 14px',
              border:       '1px solid rgba(200,255,0,0.1)',
              background:   'rgba(200,255,0,0.03)',
              marginBottom: 22,
              clipPath:     'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
            }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: '#C8FF00', margin: '0 0 4px', fontWeight: 700 }}>
              ◈ PAYMENT — COMING SOON
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#898882', margin: 0, lineHeight: 1.5 }}>
              Stripe &amp; PayPal integration is in the works. For now, buyers will contact
              you directly via your profile to arrange payment.
            </p>
          </div>

          {/* Error */}
          {state.error && (
            <p ref={errorRef} tabIndex={-1} className={styles.error}>
              {state.error}
            </p>
          )}

          <SubmitBtn />

          <p className={styles.notice}>
            LISTINGS ARE REVIEWED BEFORE GOING LIVE · USUALLY WITHIN 24 HRS
          </p>
        </form>
      </div>
    </div>
  );
}
