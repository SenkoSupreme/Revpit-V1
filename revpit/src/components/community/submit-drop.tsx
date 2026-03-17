'use client';

import { useState, useRef, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createDrop } from '@/lib/actions/community';
import { createClient } from '@/lib/supabase/client';
import styles from './submit-drop.module.css';
import type { DropType, DropTag } from '@/lib/types/community';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { type: DropType; label: string }[] = [
  { type: 'text',         label: 'Text'         },
  { type: 'image',        label: 'Image'        },
  { type: 'video',        label: 'Video'        },
  { type: 'poll',         label: 'Poll'         },
  { type: 'build_update', label: 'Build Update' },
];

const TAGS: DropTag[] = [
  'Build Update', 'Question', 'Event', 'News', 'Meme', 'Discussion',
];

const DURATIONS = [
  { label: '1 Day',  value: 1  },
  { label: '3 Days', value: 3  },
  { label: '7 Days', value: 7  },
];

const MAX_IMAGES = 4;
const MAX_TITLE  = 300;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  pitId:          string;
  pitDisplayName: string;
  onSuccess:      (dropId: string) => void;
  // Optional: pre-filled from user profile for Build Update tab
  carName?:  string;
  carSpec?:  string;
  userId?:   string;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({
  id, label, optional = false, error, hint, children,
}: {
  id?: string; label: string; optional?: boolean; error?: string; hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`${styles.label} ${optional ? styles.labelOptional : ''}`}>
        {label}
      </label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
      {hint  && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

function TitleInput({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <Field id="drop-title" label="Title" error={error}>
      <input
        id="drop-title"
        type="text"
        className={styles.input}
        placeholder="Give your drop a title…"
        value={value}
        maxLength={MAX_TITLE}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className={styles.charCount}>{value.length}/{MAX_TITLE}</span>
    </Field>
  );
}

function TagSelector({ value, onChange }: {
  value: DropTag | null; onChange: (t: DropTag | null) => void;
}) {
  return (
    <Field label="Tag" optional>
      <div className={styles.tagGrid}>
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(value === t ? null : t)}
            className={`${styles.tagBtn} ${value === t ? styles.tagBtnActive : ''}`}
          >
            {t}
          </button>
        ))}
      </div>
    </Field>
  );
}

// ─── Image upload ──────────────────────────────────────────────────────────────

interface ImageFile {
  file:    File;
  preview: string;
}

function ImageUploader({
  images, onChange, userId,
}: {
  images: ImageFile[]; onChange: (imgs: ImageFile[]) => void; userId?: string;
}) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...toAdd]);
  }, [images, onChange]);

  return (
    <Field label="Images" hint={`Up to ${MAX_IMAGES} images. JPG, PNG, WebP.`}>
      {images.length < MAX_IMAGES && (
        <div
          className={`${styles.dropZone} ${over ? styles.dropZoneOver : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            addFiles(e.dataTransfer.files);
          }}
          role="button"
          aria-label="Click or drag to upload images"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className={styles.dropZoneIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="3" y="7" width="22" height="17" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 18l6-5 5 4 4-3 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="9.5" cy="13" r="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M14 4l3 3-3 3M14 7h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={styles.dropZoneText}>
            {images.length === 0 ? 'Drag & drop or click to upload' : 'Add more images'}
          </span>
          <span className={styles.dropZoneHint}>{images.length}/{MAX_IMAGES} images</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((img, i) => (
            <div key={img.preview} className={styles.previewItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt={`Preview ${i + 1}`} className={styles.previewImg} />
              <button
                type="button"
                className={styles.previewRemove}
                aria-label={`Remove image ${i + 1}`}
                onClick={() => {
                  URL.revokeObjectURL(img.preview);
                  onChange(images.filter((_, j) => j !== i));
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </Field>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function TextPanel({ title, setTitle, tag, setTag, body, setBody, errors }: {
  title: string; setTitle: (v: string) => void;
  tag:   DropTag | null; setTag: (t: DropTag | null) => void;
  body:  string; setBody:  (v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <>
      <TitleInput value={title} onChange={setTitle} error={errors.title} />
      <TagSelector value={tag} onChange={setTag} />
      <Field id="drop-body" label="Body" optional>
        <textarea
          id="drop-body"
          className={styles.textarea}
          placeholder="Share your thoughts with the community…"
          value={body}
          maxLength={10000}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: 120 }}
        />
      </Field>
    </>
  );
}

function ImagePanel({ title, setTitle, tag, setTag, images, setImages, userId, errors }: {
  title: string; setTitle: (v: string) => void;
  tag:   DropTag | null; setTag: (t: DropTag | null) => void;
  images: ImageFile[]; setImages: (imgs: ImageFile[]) => void;
  userId?: string;
  errors: Record<string, string>;
}) {
  return (
    <>
      <TitleInput value={title} onChange={setTitle} error={errors.title} />
      <TagSelector value={tag} onChange={setTag} />
      <ImageUploader images={images} onChange={setImages} userId={userId} />
    </>
  );
}

function VideoPanel({ title, setTitle, url, setUrl, body, setBody, errors }: {
  title: string; setTitle: (v: string) => void;
  url:   string; setUrl:   (v: string) => void;
  body:  string; setBody:  (v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <>
      <TitleInput value={title} onChange={setTitle} error={errors.title} />
      <Field id="drop-url" label="Video URL" error={errors.url}
        hint="YouTube or Instagram links only.">
        <input
          id="drop-url"
          type="url"
          className={styles.input}
          placeholder="https://youtube.com/watch?v=…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </Field>
      <Field id="drop-body" label="Caption" optional>
        <textarea
          id="drop-body"
          className={styles.textarea}
          placeholder="Add context to your video drop…"
          value={body}
          maxLength={2000}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: 80 }}
        />
      </Field>
    </>
  );
}

function PollPanel({ title, setTitle, options, setOptions, duration, setDuration, errors }: {
  title: string; setTitle: (v: string) => void;
  options:  string[]; setOptions:  (o: string[]) => void;
  duration: number;   setDuration: (d: number) => void;
  errors: Record<string, string>;
}) {
  return (
    <>
      <Field id="drop-title" label="Question" error={errors.title}>
        <input
          id="drop-title"
          type="text"
          className={styles.input}
          placeholder="Ask the community…"
          value={title}
          maxLength={MAX_TITLE}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <Field label="Options" error={errors.options}>
        <div className={styles.pollOptions}>
          {options.map((opt, i) => (
            <div key={i} className={styles.pollOptionRow}>
              <input
                type="text"
                className={styles.input}
                placeholder={`Option ${i + 1}`}
                value={opt}
                maxLength={120}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                style={{ flex: 1 }}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className={styles.pollOptionRemove}
                  aria-label={`Remove option ${i + 1}`}
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {options.length < 4 && (
            <button
              type="button"
              className={styles.addOptionBtn}
              onClick={() => setOptions([...options, ''])}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add Option
            </button>
          )}
        </div>
      </Field>

      <Field label="Duration">
        <div className={styles.durationGroup}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`${styles.durationBtn} ${duration === d.value ? styles.durationBtnActive : ''}`}
              onClick={() => setDuration(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function BuildUpdatePanel({
  title, setTitle, body, setBody, images, setImages,
  userId, carName, carSpec, errors,
}: {
  title: string; setTitle: (v: string) => void;
  body:  string; setBody:  (v: string) => void;
  images: ImageFile[]; setImages: (imgs: ImageFile[]) => void;
  userId?: string; carName?: string; carSpec?: string;
  errors: Record<string, string>;
}) {
  return (
    <>
      {/* Points boost callout */}
      <div className={styles.buildCallout}>
        <div className={styles.buildCalloutHeader}>
          <span className={styles.buildCalloutLabel}>Build Update</span>
          <span className={styles.buildCalloutPts}>+20 PTS</span>
        </div>
        {carName
          ? <>
              <div className={styles.buildCalloutCar}>{carName}</div>
              {carSpec && <div className={styles.buildCalloutSpec}>{carSpec}</div>}
            </>
          : <div className={styles.buildCalloutSpec}>No car added — visit your profile to add one first.</div>
        }
      </div>

      <TitleInput value={title} onChange={setTitle} error={errors.title} />

      <Field id="drop-body" label="What did you do to your build?" error={errors.body}>
        <textarea
          id="drop-body"
          className={styles.textarea}
          placeholder="Describe the work, parts used, results…"
          value={body}
          maxLength={5000}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: 140 }}
        />
        <span className={styles.charCount}>{body.length}/5000</span>
      </Field>

      <ImageUploader images={images} onChange={setImages} userId={userId} />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SubmitDrop({ pitId, pitDisplayName, onSuccess, carName, carSpec, userId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Tab state
  const [activeType, setActiveType] = useState<DropType>('text');

  // Shared fields
  const [title,  setTitle]  = useState('');
  const [body,   setBody]   = useState('');
  const [tag,    setTag]    = useState<DropTag | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);

  // Video-specific
  const [videoUrl, setVideoUrl] = useState('');

  // Poll-specific
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState(3);

  // UI state
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!title.trim())            errs.title = 'Title is required.';
    if (title.trim().length < 3)  errs.title = 'Title must be at least 3 characters.';

    if (activeType === 'video') {
      if (!videoUrl.trim()) {
        errs.url = 'Video URL is required.';
      } else if (!/youtube\.com|youtu\.be|instagram\.com/i.test(videoUrl)) {
        errs.url = 'Only YouTube or Instagram links are supported.';
      }
    }

    if (activeType === 'poll') {
      const filled = pollOptions.filter((o) => o.trim().length > 0);
      if (filled.length < 2) errs.options = 'At least 2 options are required.';
    }

    if (activeType === 'build_update' && !body.trim()) {
      errs.body = 'Tell us what you did to your build.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Image upload to Supabase Storage ───────────────────────────────────────

  async function uploadImages(): Promise<string[]> {
    if (images.length === 0) return [];
    const supabase = createClient();
    const urls: string[] = [];

    for (const img of images) {
      const ext       = img.file.name.split('.').pop() ?? 'jpg';
      const path      = `drops/${userId ?? 'anon'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, img.file);
      if (error) throw new Error(error.message);
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      urls.push(publicUrl);
    }

    return urls;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (!validate()) return;

    startTransition(async () => {
      setServerError(null);
      setUploading(true);

      try {
        // Upload images if any
        const mediaUrls = await uploadImages();
        setUploading(false);

        // Build poll options payload
        const pollPayload = activeType === 'poll'
          ? pollOptions
              .filter((o) => o.trim())
              .map((option, i) => ({ id: String(i), option, votes: 0 }))
          : undefined;

        const result = await createDrop({
          pitId,
          title:       title.trim(),
          body:        body.trim() || undefined,
          type:        activeType,
          mediaUrls:   mediaUrls.length > 0 ? mediaUrls : undefined,
          pollOptions: pollPayload,
          tag:         tag ?? undefined,
        });

        if ('error' in result) {
          setServerError(result.error);
          return;
        }

        onSuccess(result.id);
      } catch (err) {
        setUploading(false);
        setServerError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  const busy = isPending || uploading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrap}>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className={styles.tabBar} role="tablist" aria-label="Drop type">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            role="tab"
            aria-selected={activeType === t.type}
            className={`${styles.tab} ${activeType === t.type ? styles.tabActive : ''}`}
            onClick={() => { setActiveType(t.type); setErrors({}); setServerError(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Form body ────────────────────────────────────────────────────── */}
      <div className={styles.body} role="tabpanel">
        {serverError && (
          <p className={styles.errorBanner} role="alert">{serverError}</p>
        )}

        {activeType === 'text' && (
          <TextPanel
            title={title}   setTitle={setTitle}
            tag={tag}       setTag={setTag}
            body={body}     setBody={setBody}
            errors={errors}
          />
        )}

        {activeType === 'image' && (
          <ImagePanel
            title={title}     setTitle={setTitle}
            tag={tag}         setTag={setTag}
            images={images}   setImages={setImages}
            userId={userId}
            errors={errors}
          />
        )}

        {activeType === 'video' && (
          <VideoPanel
            title={title}      setTitle={setTitle}
            url={videoUrl}     setUrl={setVideoUrl}
            body={body}        setBody={setBody}
            errors={errors}
          />
        )}

        {activeType === 'poll' && (
          <PollPanel
            title={title}           setTitle={setTitle}
            options={pollOptions}   setOptions={setPollOptions}
            duration={pollDuration} setDuration={setPollDuration}
            errors={errors}
          />
        )}

        {activeType === 'build_update' && (
          <BuildUpdatePanel
            title={title}   setTitle={setTitle}
            body={body}     setBody={setBody}
            images={images} setImages={setImages}
            userId={userId}
            carName={carName}
            carSpec={carSpec}
            errors={errors}
          />
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className={styles.footer}>
        <span className={styles.pitLabel}>
          Posting to
          <span className={styles.pitLabelName}>{pitDisplayName}</span>
        </span>

        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={busy}
          aria-busy={busy}
        >
          {uploading ? 'Uploading…' : isPending ? 'Posting…' : 'DROP IT ⚡'}
        </button>
      </div>

    </div>
  );
}
