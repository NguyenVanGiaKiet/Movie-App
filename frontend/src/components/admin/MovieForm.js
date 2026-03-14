'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'phim-le',   label: 'Phim lẻ' },
  { value: 'phim-bo',   label: 'Phim bộ' },
  { value: 'tv-shows',  label: 'TV Shows' },
  { value: 'hoat-hinh', label: 'Hoạt hình' },
];
const QUALITIES = ['HD','FHD','4K','CAM','SD'];
const LANGS     = ['Vietsub','Thuyết minh','Lồng tiếng','Thuyết minh + Vietsub'];
const STATUSES  = [{ value:'completed', label:'Hoàn tất' },{ value:'ongoing', label:'Đang chiếu' },{ value:'trailer', label:'Trailer' }];

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
    <input className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
    <select className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" style={{background:'rgba(255,255,255,0.05)'}} {...props}>
      {options.map(o => (
        <option key={o.value || o} value={o.value || o} style={{background:'#1a1a22'}}>
          {o.label || o}
        </option>
      ))}
    </select>
  </div>
);

export default function MovieForm({ initialData, onSubmit, submitLabel = 'Lưu' }) {
  const isEdit = !!initialData;
  const [loading,    setLoading]    = useState(false);
  const [categories, setCategories] = useState([]);
  const [countries,  setCountries]  = useState([]);

  const [form, setForm] = useState({
    name:            '',
    origin_name:     '',
    slug:            '',
    content:         '',
    type:            'phim-le',
    status:          'completed',
    thumb_url:       '',
    poster_url:      '',
    trailer_url:     '',
    link_embed:      '',
    time:            '',
    episode_current: 'Full',
    episode_total:   '',
    quality:         'HD',
    lang:            'Vietsub',
    year:            new Date().getFullYear(),
    categoryNames:   [],
    countryNames:    [],
    director:        '',
    actor:           '',
    is_shown:        true,
  });

  useEffect(() => {
    Promise.all([adminAPI.listCategories(), adminAPI.listCountries()])
      .then(([c, co]) => { setCategories(c.data || []); setCountries(co.data || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      name:            initialData.name || '',
      origin_name:     initialData.origin_name || '',
      slug:            initialData.slug || '',
      content:         initialData.content || '',
      type:            initialData.type || 'phim-le',
      status:          initialData.status || 'completed',
      thumb_url:       initialData.thumb_url || '',
      poster_url:      initialData.poster_url || '',
      trailer_url:     initialData.trailer_url || '',
      link_embed:      initialData.link_embed || '',
      time:            initialData.time || '',
      episode_current: initialData.episode_current || 'Full',
      episode_total:   initialData.episode_total || '',
      quality:         initialData.quality || 'HD',
      lang:            initialData.lang || 'Vietsub',
      year:            initialData.year || new Date().getFullYear(),
      categoryNames:   (initialData.category || []).map(c => c.name),
      countryNames:    (initialData.country  || []).map(c => c.name),
      director:        (initialData.director || []).join(', '),
      actor:           (initialData.actor    || []).join(', '),
      is_shown:        initialData.is_shown ?? true,
    });
  }, [initialData]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setCheck = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }));

  const toggleMulti = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(v => v !== val)
        : [...f[field], val],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Tên phim là bắt buộc');
    setLoading(true);
    try {
      const payload = {
        ...form,
        year:     parseInt(form.year),
        director: form.director.split(',').map(s => s.trim()).filter(Boolean),
        actor:    form.actor.split(',').map(s => s.trim()).filter(Boolean),
      };
      await onSubmit(payload);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div className="glass rounded-2xl p-6 mb-6">
      <h2 className="text-sm font-semibold text-brand-red uppercase tracking-widest mb-5 border-b border-white/10 pb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Section title="Thông tin cơ bản">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Tên phim *" value={form.name} onChange={set('name')} placeholder="Tên tiếng Việt" required />
          <Input label="Tên gốc" value={form.origin_name} onChange={set('origin_name')} placeholder="Original title" />
        </div>
        <Input label="Slug (tự động nếu để trống)" value={form.slug} onChange={set('slug')} placeholder="ten-phim-slug" />
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Mô tả / Nội dung</label>
          <textarea
            value={form.content} onChange={set('content')}
            placeholder="Giới thiệu nội dung phim..."
            rows={4}
            className="input-dark w-full px-3 py-2.5 rounded-xl text-sm resize-none"
          />
        </div>
      </Section>

      <Section title="Phân loại">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Select label="Loại phim"   options={TYPES}     value={form.type}    onChange={set('type')} />
          <Select label="Trạng thái"  options={STATUSES}  value={form.status}  onChange={set('status')} />
          <Select label="Chất lượng"  options={QUALITIES} value={form.quality} onChange={set('quality')} />
          <Select label="Ngôn ngữ"    options={LANGS}     value={form.lang}    onChange={set('lang')} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Input label="Năm phát hành" type="number" value={form.year} onChange={set('year')} min="1900" max="2030" />
          <Input label="Thời lượng" value={form.time} onChange={set('time')} placeholder="120 phút" />
          <Input label="Tập hiện tại" value={form.episode_current} onChange={set('episode_current')} placeholder="Full / Tập 12" />
        </div>
      </Section>

      <Section title="Hình ảnh & Trailer">
        <Input label="Thumbnail URL" value={form.thumb_url} onChange={set('thumb_url')} placeholder="https://..." />
        <Input label="Poster URL" value={form.poster_url} onChange={set('poster_url')} placeholder="https://..." />
        <Input label="Trailer URL (YouTube embed)" value={form.trailer_url} onChange={set('trailer_url')} placeholder="https://www.youtube.com/embed/..." />
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            🎬 Video URL — Link xem phim trực tiếp (embed)
          </label>
          <input
            value={form.link_embed}
            onChange={set('link_embed')}
            placeholder="VD: https://embed14.streamc.xyz/embed.php?hash=abc123"
            className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
          />
          <p className="text-xs text-gray-600 mt-1">Dùng cho phim lẻ không cần tạo server/tập. Hỗ trợ mọi iframe embed.</p>
        </div>
        {form.thumb_url && (
          <div className="flex gap-3 mt-2">
            <img src={form.thumb_url} alt="thumb" className="h-24 rounded-lg object-cover" onError={e => e.target.style.display='none'} />
            {form.poster_url && <img src={form.poster_url} alt="poster" className="h-24 rounded-lg object-cover" onError={e => e.target.style.display='none'} />}
          </div>
        )}
      </Section>

      <Section title="Thể loại">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có thể loại. <a href="/admin" className="text-brand-red">Thêm tại đây</a></p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c._id} type="button"
                onClick={() => toggleMulti('categoryNames', c.name)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  form.categoryNames.includes(c.name)
                    ? 'bg-brand-red text-white'
                    : 'glass text-gray-300 hover:bg-white/20'
                }`}>{c.name}</button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Quốc gia">
        <div className="flex flex-wrap gap-2">
          {countries.map(c => (
            <button key={c._id} type="button"
              onClick={() => toggleMulti('countryNames', c.name)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                form.countryNames.includes(c.name)
                  ? 'bg-blue-600 text-white'
                  : 'glass text-gray-300 hover:bg-white/20'
              }`}>{c.name}</button>
          ))}
        </div>
      </Section>

      <Section title="Diễn viên & Đạo diễn">
        <Input label="Đạo diễn (cách nhau bằng dấu phẩy)" value={form.director} onChange={set('director')} placeholder="Christopher Nolan, Steven Spielberg" />
        <Input label="Diễn viên (cách nhau bằng dấu phẩy)" value={form.actor} onChange={set('actor')} placeholder="Leonardo DiCaprio, Brad Pitt, ..." />
      </Section>

      <div className="flex items-center justify-between mb-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_shown} onChange={setCheck('is_shown')}
            className="w-4 h-4 accent-brand-red" />
          <span className="text-sm text-gray-300">Hiển thị phim trên trang web</span>
        </label>
        <button type="submit" disabled={loading}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-60">
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
