'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { commentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Heart, Trash2, Reply, ChevronDown, Send, MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

/* ── helpers ── */
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s} giây trước`;
  if (s < 3600) return `${Math.floor(s/60)} phút trước`;
  if (s < 86400) return `${Math.floor(s/3600)} giờ trước`;
  if (s < 2592000) return `${Math.floor(s/86400)} ngày trước`;
  return new Date(date).toLocaleDateString('vi-VN');
}

function Avatar({ user, size = 36 }) {
  const letter = (user?.name || 'U')[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #E50914, #8B0000)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#fff',
    }}>
      {letter}
    </div>
  );
}

/* ── Single comment ── */
function CommentItem({ comment, currentUser, slug, onDelete, depth = 0 }) {
  const { isAuthenticated } = useAuth();
  const [liked,      setLiked]      = useState(comment.likedByMe);
  const [likeCount,  setLikeCount]  = useState(comment.likeCount);
  const [showReply,  setShowReply]  = useState(false);
  const [replyText,  setReplyText]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replies,    setReplies]    = useState(comment.replies || []);
  const [showReplies,setShowReplies]= useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const replyRef = useRef(null);
  const isOwner = currentUser && comment.user?._id === currentUser._id;
  const isAdmin = currentUser?.role === 'admin';

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Đăng nhập để thích bình luận'); return; }
    try {
      const response = await commentAPI.toggleLike(comment._id);
      const data = response.data || response;
      setLiked(data.likedByMe);
      setLikeCount(data.likeCount);
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentAPI.createComment(slug, replyText.trim(), comment._id);
      setReplies(prev => [...prev, data.data]);
      setReplyText('');
      setShowReply(false);
      setShowReplies(true);
      toast.success('Đã trả lời');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const loadReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const { data } = await commentAPI.getReplies(comment._id);
      setReplies(data.data);
      setShowReplies(true);
    } catch { toast.error('Không thể tải phản hồi'); }
    finally { setLoadingReplies(false); }
  };

  const replyCount = comment.replyCount || (comment.replies || []).length;

  return (
    <div className={`cmt-item${depth > 0 ? ' cmt-reply' : ''}`}>
      <Avatar user={comment.user} size={depth > 0 ? 30 : 38} />

      <div className="cmt-body">
        <div className="cmt-header">
          <span className="cmt-name">{comment.user?.name || 'Ẩn danh'}</span>
          <span className="cmt-time">{timeAgo(comment.createdAt)}</span>
        </div>

        <p className="cmt-content">{comment.content}</p>

        <div className="cmt-actions">
          <button onClick={handleLike} className={`cmt-action-btn${liked ? ' liked' : ''}`}>
            <Heart style={{ width: 13, height: 13, fill: liked ? 'currentColor' : 'none' }} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {depth === 0 && isAuthenticated && (
            <button
              onClick={() => { setShowReply(v => !v); setTimeout(() => replyRef.current?.focus(), 50); }}
              className="cmt-action-btn"
            >
              <Reply style={{ width: 13, height: 13 }} /> Trả lời
            </button>
          )}

          {(isOwner || isAdmin) && (
            <button onClick={() => onDelete(comment._id)} className="cmt-action-btn delete">
              <Trash2 style={{ width: 13, height: 13 }} /> Xóa
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReply && (
          <div className="cmt-reply-input">
            <textarea
              ref={replyRef}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Viết phản hồi..."
              className="cmt-textarea cmt-textarea-sm"
              rows={2}
              maxLength={500}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
              <button onClick={() => setShowReply(false)} className="cmt-btn-ghost">Huỷ</button>
              <button onClick={handleReply} disabled={submitting || !replyText.trim()} className="cmt-btn-send">
                {submitting ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 14, height: 14 }} />}
                Gửi
              </button>
            </div>
          </div>
        )}

        {/* Show replies */}
        {depth === 0 && (comment.replies?.length || 0) > 0 && (
          <button onClick={() => setShowReplies(!showReplies)} className="cmt-show-replies" disabled={loadingReplies}>
            {loadingReplies
              ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
              : <ChevronDown style={{ width: 13, height: 13, transform: showReplies ? 'rotate(180deg)' : 'none' }} />}
            {comment.replies?.length || 0} phản hồi
          </button>
        )}

        {showReplies && (replies?.length || 0) > 0 && (
          <div className="cmt-replies-wrap">
            {(showReplies ? replies : comment.replies).filter(r => r && r._id).map(r => (
              <CommentItem
                key={r._id} comment={r} currentUser={currentUser}
                slug={slug} onDelete={onDelete} depth={1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Comments component ── */
export default function Comments({ slug }) {
  const { isAuthenticated, user } = useAuth();
  const [comments,    setComments]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text,        setText]        = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const textareaRef = useRef(null);
  const [stableSlug, setStableSlug] = useState(slug);

  const fetchComments = async (p = 1, append = false) => {
    if (loading && !append && p === 1) return;
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const { data } = await commentAPI.getComments(stableSlug, p);
      const commentsData = Array.isArray(data) ? data : (data?.data || []);
      if (append) setComments(prev => [...prev, ...commentsData]);
      else        setComments(commentsData);
      setTotal(Array.isArray(data) ? data.length : (data?.pagination?.total || 0));
      setHasMore(p < (data?.pagination?.pages || 1));
      setPage(p);
    } catch (err) { 
      toast.error('Không thể tải bình luận'); 
    }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug !== stableSlug) {
        setStableSlug(slug);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => { 
    if (stableSlug) fetchComments(1); 
  }, [stableSlug]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentAPI.createComment(slug, text.trim());
      setComments(prev => [data.data, ...prev]);
      setTotal(t => t + 1);
      setText('');
      toast.success('Đã đăng bình luận');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await commentAPI.deleteComment(id);
      // soft-remove from state
      setComments(prev => prev.map(c =>
        c._id === id
          ? { ...c, content: '[Bình luận đã bị xóa]', isDeleted: true }
          : { ...c, replies: (c.replies||[]).map(r => r._id === id ? { ...r, content: '[Bình luận đã bị xóa]', isDeleted: true } : r) }
      ));
      toast.success('Đã xóa');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <>
      <style>{`
        .cmt-root { margin-top: 3rem; }
        .cmt-heading {
          display: flex; align-items: center; gap: 12px;
          font-family: var(--font-display, 'Bebas Neue', sans-serif);
          font-size: 1.6rem; letter-spacing: .1em; color: #fff;
          margin-bottom: 1.5rem;
        }
        .cmt-heading-bar { width: 3px; height: 1em; background: #E50914; border-radius: 1px; flex-shrink: 0; }
        .cmt-count { font-size: 14px; font-weight: 500; color: rgba(255,255,255,.4); font-family: inherit; letter-spacing: 0; margin-left: 4px; }

        /* Compose box */
        .cmt-compose {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px; padding: 16px; margin-bottom: 2rem;
        }
        .cmt-compose-inner { display: flex; gap: 12px; }
        .cmt-textarea {
          flex: 1; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; padding: 12px; color: #fff; font-size: 14px; line-height: 1.6;
          resize: none; outline: none; transition: border-color .2s; font-family: inherit;
          width: 100%;
        }
        .cmt-textarea:focus { border-color: rgba(229,9,20,.5); background: rgba(255,255,255,.08); }
        .cmt-textarea::placeholder { color: rgba(255,255,255,.3); }
        .cmt-textarea-sm { font-size: 13px; padding: 8px 10px; }

        .cmt-compose-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 10px; padding-left: 50px;
        }
        .cmt-char-count { font-size: 11px; color: rgba(255,255,255,.3); }

        /* Buttons */
        .cmt-btn-send {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 6px;
          background: #E50914; color: #fff; font-size: 13px; font-weight: 600;
          transition: all .2s; cursor: pointer; border: none;
        }
        .cmt-btn-send:hover:not(:disabled) { background: #ff1a2a; }
        .cmt-btn-send:disabled { opacity: .45; cursor: not-allowed; }
        .cmt-btn-ghost {
          padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.5); background: transparent; border: none;
          cursor: pointer; transition: color .2s;
        }
        .cmt-btn-ghost:hover { color: #fff; }

        /* Login prompt */
        .cmt-login-prompt {
          padding: 16px; border: 1px dashed rgba(255,255,255,.1);
          border-radius: 10px; text-align: center; color: rgba(255,255,255,.4);
          font-size: 14px; margin-bottom: 2rem;
        }
        .cmt-login-prompt a { color: #E50914; text-decoration: none; font-weight: 600; }
        .cmt-login-prompt a:hover { text-decoration: underline; }

        /* Comment items */
        .cmt-list { display: flex; flex-direction: column; gap: 0; }
        .cmt-item {
          display: flex; gap: 12px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .cmt-item:last-child { border-bottom: none; }
        .cmt-reply {
          padding: 12px 0 8px;
          border-bottom: none;
        }
        .cmt-body { flex: 1; min-width: 0; }
        .cmt-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .cmt-name { font-size: 13px; font-weight: 700; color: #fff; }
        .cmt-time { font-size: 11px; color: rgba(255,255,255,.35); }
        .cmt-content {
          font-size: 14px; line-height: 1.65; color: rgba(255,255,255,.8);
          word-break: break-word; margin-bottom: 8px;
          white-space: pre-wrap;
        }

        /* Actions */
        .cmt-actions { display: flex; align-items: center; gap: 12px; }
        .cmt-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500; color: rgba(255,255,255,.4);
          background: none; border: none; cursor: pointer; padding: 2px 0;
          transition: color .2s;
        }
        .cmt-action-btn:hover { color: rgba(255,255,255,.8); }
        .cmt-action-btn.liked { color: #E50914; }
        .cmt-action-btn.delete:hover { color: #ff4444; }

        .cmt-show-replies {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600; color: rgba(229,9,20,.8);
          background: none; border: none; cursor: pointer;
          margin-top: 6px; padding: 0; transition: color .2s;
        }
        .cmt-show-replies:hover { color: #E50914; }

        .cmt-replies-wrap {
          margin-top: 8px; padding-left: 16px;
          border-left: 2px solid rgba(255,255,255,.07);
        }

        .cmt-reply-input { margin-top: 10px; }

        /* Load more */
        .cmt-load-more {
          width: 100%; padding: 12px; margin-top: 16px;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px; color: rgba(255,255,255,.6); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .cmt-load-more:hover { background: rgba(255,255,255,.1); color: #fff; }
        .cmt-load-more:disabled { opacity: .4; cursor: not-allowed; }

        /* Empty */
        .cmt-empty {
          text-align: center; padding: 3rem 0;
          color: rgba(255,255,255,.3); font-size: 14px;
        }
        .cmt-empty svg { opacity: .2; margin: 0 auto 12px; display: block; }

        /* Skeleton */
        .cmt-skeleton { display: flex; gap: 12px; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
        .cmt-sk-avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; }
        .cmt-sk-body { flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }
        .cmt-sk-line { height: 12px; border-radius: 4px; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cmt-root">
        {/* Heading */}
        <div className="cmt-heading">
          <span className="cmt-heading-bar" />
          BÌNH LUẬN
          {total > 0 && <span className="cmt-count">({total})</span>}
        </div>

        {/* Compose */}
        {isAuthenticated ? (
          <div className="cmt-compose">
            <div className="cmt-compose-inner">
              <Avatar user={user} size={38} />
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..."
                className="cmt-textarea"
                rows={3}
                maxLength={1000}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
              />
            </div>
            <div className="cmt-compose-footer">
              <span className="cmt-char-count">{text.length}/1000 · Ctrl+Enter để gửi</span>
              <button onClick={handleSubmit} disabled={submitting || !text.trim()} className="cmt-btn-send">
                {submitting
                  ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  : <Send style={{ width: 14, height: 14 }} />}
                Đăng bình luận
              </button>
            </div>
          </div>
        ) : (
          <div className="cmt-login-prompt">
            <Link href="/login">Đăng nhập</Link> để bình luận và chia sẻ cảm nhận của bạn
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="cmt-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="cmt-skeleton">
                <div className="skeleton cmt-sk-avatar" />
                <div className="cmt-sk-body">
                  <div className="skeleton cmt-sk-line" style={{ width: '25%' }} />
                  <div className="skeleton cmt-sk-line" style={{ width: '80%' }} />
                  <div className="skeleton cmt-sk-line" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (comments?.length ?? 0) === 0 ? (
          <div className="cmt-empty">
            <MessageCircle style={{ width: 48, height: 48 }} />
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          <>
            <div className="cmt-list">
              {comments?.filter(c => c && c._id).map(c => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  currentUser={user}
                  slug={slug}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {hasMore && (
              <button
                className="cmt-load-more"
                onClick={() => fetchComments(page + 1, true)}
                disabled={loadingMore}
              >
                {loadingMore
                  ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Đang tải...</>
                  : <><ChevronDown style={{ width: 14, height: 14 }} /> Xem thêm bình luận</>}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}