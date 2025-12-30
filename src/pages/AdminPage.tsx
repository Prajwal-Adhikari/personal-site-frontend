import React from 'react';
import {
  addBlogUpload,
  createUploadId,
  loadBlogUploads,
  removeBlogUpload,
  type BlogUpload,
} from '../utils/blogStorage';

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

const formatSize = (size: number) => {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`;
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`;
  return `${size} B`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AdminPage: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [uploads, setUploads] = React.useState<BlogUpload[]>(() =>
    loadBlogUploads()
  );
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const resetMessages = () => {
    setError(null);
    setStatus(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetMessages();
    const selected = event.target.files?.[0];
    setFile(selected ?? null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!title.trim()) {
      setError('Add a title for this blog PDF.');
      return;
    }

    if (!file) {
      setError('Attach a PDF to upload.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    setIsSaving(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);

      const newUpload: BlogUpload = {
        id: createUploadId(),
        title: title.trim(),
        summary: summary.trim() || undefined,
        fileName: file.name,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      const nextUploads = addBlogUpload(newUpload);
      setUploads(nextUploads);
      setTitle('');
      setSummary('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setStatus(`Uploaded "${newUpload.title}"`);
    } catch (uploadError) {
      console.error(uploadError);
      setError('Upload failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    const next = removeBlogUpload(id);
    setUploads(next);
  };

  return (
    <section className="section admin-section">
      <div className="admin-header">
        <div>
          <p className="muted">Admin · Blog uploads</p>
          <h2>Upload PDFs for your blog</h2>
          <p className="muted">
            Store PDFs alongside a title and short summary. Files are saved in
            this browser only until a backend is connected.
          </p>
        </div>
        <span className="pill">Local device storage</span>
      </div>

      <div className="admin-grid">
        <form className="admin-card" onSubmit={handleSubmit}>
          <div className="admin-card-header">
            <h3>New upload</h3>
            <span className="pill">PDF only</span>
          </div>

          <label className="admin-field">
            <span className="admin-label">Title</span>
            <input
              className="admin-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Building a Rust CLI"
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Summary (optional)</span>
            <textarea
              className="admin-textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add a short note about what’s inside."
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Attach PDF</span>
            <input
              ref={fileInputRef}
              className="admin-input admin-file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <span className="admin-hint">
              Files are encoded and stored in localStorage; keep them small
              until an API endpoint is available.
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}
          {status && <p className="form-success">{status}</p>}

          <div className="admin-actions">
            <button className="btn primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Uploading…' : 'Save PDF'}
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setTitle('');
                setSummary('');
                setFile(null);
                resetMessages();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent uploads</h3>
            <button
              className="text-link"
              type="button"
              onClick={() => setUploads(loadBlogUploads())}
            >
              Refresh
            </button>
          </div>

          {uploads.length === 0 ? (
            <p className="muted">
              No PDFs yet. Upload one to start populating your blog section.
            </p>
          ) : (
            <ul className="upload-list">
              {uploads.map((upload) => (
                <li key={upload.id} className="upload-item">
                  <div className="upload-title-row">
                    <div>
                      <h4 className="upload-title">{upload.title}</h4>
                      {upload.summary && (
                        <p className="muted upload-summary">{upload.summary}</p>
                      )}
                      <p className="upload-meta">
                        {upload.fileName} · {formatSize(upload.size)} ·{' '}
                        {formatDate(upload.uploadedAt)}
                      </p>
                    </div>
                    <span className="pill">PDF</span>
                  </div>

                  <div className="upload-actions">
                    <a
                      className="btn secondary"
                      href={upload.dataUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open PDF
                    </a>
                    <button
                      className="btn secondary danger"
                      type="button"
                      onClick={() => handleDelete(upload.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminPage;
