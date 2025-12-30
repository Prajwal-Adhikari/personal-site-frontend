import React from 'react';
import { loadBlogUploads, type BlogUpload } from '../utils/blogStorage';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatSize = (size: number) => {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`;
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`;
  return `${size} B`;
};

const isAdminNavEnabled = () =>
  typeof window !== 'undefined' &&
  localStorage.getItem('showAdminNav') === 'true';

const BlogPage: React.FC = () => {
  const [uploads, setUploads] = React.useState<BlogUpload[]>([]);
  const [canManage, setCanManage] = React.useState(false);

  React.useEffect(() => {
    setUploads(loadBlogUploads());
    setCanManage(isAdminNavEnabled());
  }, []);

  return (
    <section className="section">
      <h2>Blog</h2>
      <p>
        I’ll use this page for notes and posts about what I’m learning. When a
        post is PDF-first, you’ll find it here. Upload new PDFs from the admin
        page to see them listed below.
      </p>

      {uploads.length === 0 ? (
        <p className="muted">
          No PDF posts yet. Head to the admin page to upload your first one.
        </p>
      ) : (
        <div className="blog-grid">
          {uploads.map((upload) => (
            <article key={upload.id} className="blog-card">
              <div className="blog-card-header">
                <h3 className="project-title">{upload.title}</h3>
                <span className="pill">{formatSize(upload.size)}</span>
              </div>
              {upload.summary && (
                <p className="blog-summary">{upload.summary}</p>
              )}
              <p className="blog-meta">
                {upload.fileName} · {formatDate(upload.uploadedAt)}
              </p>
              <div className="blog-actions">
                <a
                  className="btn secondary"
                  href={upload.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read PDF
                </a>
                {canManage && (
                  <a className="text-link" href="/admin">
                    Manage in admin
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogPage;
