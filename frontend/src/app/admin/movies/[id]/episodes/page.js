'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { Plus, Trash2, Save, ArrowLeft, Server, Film, Edit2, Check, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EpisodesPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [movie,      setMovie]      = useState(null);
  const [episodes,   setEpisodes]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  // New server form
  const [newServerName, setNewServerName] = useState('');
  const [addingServer,  setAddingServer]  = useState(false);

  // New episode form state per server
  const [newEp,    setNewEp]    = useState({});   // { [serverId]: {name, link_embed, link_m3u8} }
  const [addingEp, setAddingEp] = useState({});   // { [serverId]: bool }

  // Edit episode
  const [editEp, setEditEp] = useState(null); // { serverId, epId, name, link_embed, link_m3u8 }

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') router.push('/');
  }, [user, authLoading]);

  const fetchEpisodes = async () => {
    try {
      const [epRes, movieRes] = await Promise.all([
        adminAPI.getEpisodes(id),
        adminAPI.getMovie(id),
      ]);
      setEpisodes(epRes.data || []);
      setMovie(movieRes.data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchEpisodes(); }, [id]);

  // ── Server actions ───────────────────────────────────────────────
  const addServer = async () => {
    if (!newServerName.trim()) return toast.error('Nhập tên server');
    setAddingServer(true);
    try {
      await adminAPI.addServer(id, { server_name: newServerName });
      setNewServerName('');
      await fetchEpisodes();
      toast.success('Đã thêm server');
    } catch (e) { toast.error(e.message); }
    finally { setAddingServer(false); }
  };

  const deleteServer = async (sid, name) => {
    if (!confirm(`Xóa server "${name}" và tất cả tập phim?`)) return;
    try {
      await adminAPI.deleteServer(id, sid);
      await fetchEpisodes();
      toast.success('Đã xóa server');
    } catch (e) { toast.error(e.message); }
  };

  // ── Episode actions ──────────────────────────────────────────────
  const initNewEp = (sid) => setNewEp(p => ({
    ...p, [sid]: { name: '', link_embed: '', link_m3u8: '' }
  }));

  const addEpisode = async (sid) => {
    const ep = newEp[sid];
    if (!ep?.name?.trim()) return toast.error('Nhập tên tập');
    if (!ep.link_embed?.trim() && !ep.link_m3u8?.trim()) return toast.error('Nhập ít nhất 1 link video');
    try {
      await adminAPI.addEpisode(id, sid, ep);
      setNewEp(p => { const n = {...p}; delete n[sid]; return n; });
      await fetchEpisodes();
      toast.success('Đã thêm tập phim');
    } catch (e) { toast.error(e.message); }
  };

  const saveEditEp = async () => {
    if (!editEp) return;
    try {
      await adminAPI.updateEpisode(id, editEp.serverId, editEp.epId, {
        name: editEp.name, link_embed: editEp.link_embed, link_m3u8: editEp.link_m3u8,
      });
      setEditEp(null);
      await fetchEpisodes();
      toast.success('Đã cập nhật tập phim');
    } catch (e) { toast.error(e.message); }
  };

  const deleteEpisode = async (sid, eid, name) => {
    if (!confirm(`Xóa "${name}"?`)) return;
    try {
      await adminAPI.deleteEpisode(id, sid, eid);
      await fetchEpisodes();
      toast.success('Đã xóa tập phim');
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#181820] pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#181820] pt-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/movies" className="p-2 glass rounded-xl hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">QUẢN LÝ TẬP PHIM</h1>
          <p className="text-gray-400 text-sm">{movie?.name} • {episodes.reduce((a,s) => a + (s.server_data?.length||0), 0)} tập</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href={`/movie/${movie?.slug}`} target="_blank"
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs">
            <ExternalLink className="w-3.5 h-3.5" /> Xem phim
          </Link>
          <Link href={`/admin/movies/${id}`}
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs">
            <Edit2 className="w-3.5 h-3.5" /> Sửa thông tin
          </Link>
        </div>
      </div>

      {/* Add Server */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-red" /> Thêm Server
        </h2>
        <div className="flex gap-3">
          <input
            value={newServerName}
            onChange={e => setNewServerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addServer()}
            placeholder="Tên server (VD: Server Vietsub, Server HD...)"
            className="input-dark flex-1 px-3 py-2.5 rounded-xl text-sm"
          />
          <button onClick={addServer} disabled={addingServer}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Thêm server
          </button>
        </div>
      </div>

      {/* Servers list */}
      {episodes.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Server className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">Chưa có server nào. Thêm server ở trên rồi thêm link video.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {episodes.map((server) => (
            <div key={server._id} className="glass rounded-2xl overflow-hidden">
              {/* Server header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-brand-red" />
                  <h3 className="font-semibold text-white">{server.server_name}</h3>
                  <span className="text-xs text-gray-500">({server.server_data?.length || 0} tập)</span>
                </div>
                <button onClick={() => deleteServer(server._id, server.server_name)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Episode list */}
              <div className="divide-y divide-white/5">
                {(server.server_data || []).map((ep) => (
                  <div key={ep._id} className="px-5 py-3">
                    {editEp?.epId === ep._id ? (
                      /* Edit mode */
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input value={editEp.name} onChange={e => setEditEp(p => ({...p, name: e.target.value}))}
                            placeholder="Tên tập" className="input-dark px-3 py-2 rounded-lg text-sm flex-1" />
                          <button onClick={saveEditEp} className="p-2 bg-green-600 rounded-lg text-white hover:bg-green-700">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditEp(null)} className="p-2 glass rounded-lg text-gray-400 hover:bg-white/20">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input value={editEp.link_embed} onChange={e => setEditEp(p => ({...p, link_embed: e.target.value}))}
                          placeholder="Link Embed (iframe URL)" className="input-dark w-full px-3 py-2 rounded-lg text-sm" />
                        <input value={editEp.link_m3u8} onChange={e => setEditEp(p => ({...p, link_m3u8: e.target.value}))}
                          placeholder="Link M3U8 (direct stream)" className="input-dark w-full px-3 py-2 rounded-lg text-sm" />
                      </div>
                    ) : (
                      /* View mode */
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{ep.name}</p>
                          <div className="mt-1 space-y-0.5">
                            {ep.link_embed && (
                              <p className="text-xs text-gray-500 truncate">
                                <span className="text-blue-400 font-medium">Embed:</span> {ep.link_embed}
                              </p>
                            )}
                            {ep.link_m3u8 && (
                              <p className="text-xs text-gray-500 truncate">
                                <span className="text-green-400 font-medium">M3U8:</span> {ep.link_m3u8}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditEp({ serverId: server._id, epId: ep._id, name: ep.name, link_embed: ep.link_embed, link_m3u8: ep.link_m3u8 })}
                            className="p-1.5 glass rounded-lg text-yellow-400 hover:bg-white/20 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteEpisode(server._id, ep._id, ep.name)}
                            className="p-1.5 glass rounded-lg text-red-400 hover:bg-white/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add episode form */}
              <div className="px-5 pb-4 pt-3 border-t border-white/10">
                {newEp[server._id] ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-medium mb-2">Thêm tập phim mới:</p>
                    <input
                      value={newEp[server._id].name}
                      onChange={e => setNewEp(p => ({...p, [server._id]: {...p[server._id], name: e.target.value}}))}
                      placeholder="Tên tập (VD: Tập 1, Full, Part 1...)"
                      className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                    />
                    <input
                      value={newEp[server._id].link_embed}
                      onChange={e => setNewEp(p => ({...p, [server._id]: {...p[server._id], link_embed: e.target.value}}))}
                      placeholder="🔗 Link Embed (iframe) — VD: https://player.example.com/embed/abc"
                      className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                    />
                    <input
                      value={newEp[server._id].link_m3u8}
                      onChange={e => setNewEp(p => ({...p, [server._id]: {...p[server._id], link_m3u8: e.target.value}}))}
                      placeholder="📡 Link M3U8/Direct — VD: https://cdn.example.com/phim.m3u8"
                      className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => addEpisode(server._id)}
                        className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold">
                        <Save className="w-3.5 h-3.5" /> Lưu tập phim
                      </button>
                      <button onClick={() => setNewEp(p => { const n={...p}; delete n[server._id]; return n; })}
                        className="btn-secondary px-4 py-2 rounded-lg text-sm">Hủy</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => initNewEp(server._id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-dashed border-white/20">
                    <Plus className="w-4 h-4" /> Thêm tập phim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link type guide */}
      <div className="mt-8 glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">💡 Hướng dẫn thêm link video</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-400">
          <div className="space-y-1.5">
            <p className="text-blue-400 font-semibold">Link Embed (iframe)</p>
            <p>Dùng cho các player nhúng iframe:</p>
            <code className="block bg-black/40 px-2 py-1.5 rounded text-gray-300 break-all">https://player.phimapi.com/player/?url=...</code>
            <code className="block bg-black/40 px-2 py-1.5 rounded text-gray-300 break-all">https://www.youtube.com/embed/VIDEO_ID</code>
          </div>
          <div className="space-y-1.5">
            <p className="text-green-400 font-semibold">Link M3U8 / Direct</p>
            <p>Dùng cho stream trực tiếp:</p>
            <code className="block bg-black/40 px-2 py-1.5 rounded text-gray-300 break-all">https://cdn.example.com/phim/tap1.m3u8</code>
            <code className="block bg-black/40 px-2 py-1.5 rounded text-gray-300 break-all">https://cdn.example.com/phim/tap1.mp4</code>
          </div>
        </div>
      </div>
    </div>
  );
}
