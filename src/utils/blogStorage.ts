export type BlogUpload = {
  id: string;
  title: string;
  summary?: string;
  fileName: string;
  dataUrl: string;
  uploadedAt: string;
  size: number;
};

const STORAGE_KEY = 'blogUploads';

const isBrowser = typeof window !== 'undefined';

const fallbackId = () => Math.random().toString(36).slice(2, 10);

export const createUploadId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : fallbackId();

export const loadBlogUploads = (): BlogUpload[] => {
  if (!isBrowser) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as BlogUpload[];
  } catch (error) {
    console.error('Failed to read blog uploads from storage', error);
    return [];
  }
};

export const saveBlogUploads = (uploads: BlogUpload[]) => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
};

export const addBlogUpload = (upload: BlogUpload): BlogUpload[] => {
  const uploads = loadBlogUploads();
  const next = [upload, ...uploads];
  saveBlogUploads(next);
  return next;
};

export const removeBlogUpload = (id: string): BlogUpload[] => {
  const uploads = loadBlogUploads().filter((upload) => upload.id !== id);
  saveBlogUploads(uploads);
  return uploads;
};
