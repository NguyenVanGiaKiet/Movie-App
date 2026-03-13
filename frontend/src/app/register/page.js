'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Film, Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Field = ({ icon: Icon, name, type = 'text', placeholder, label, showPass, errors, onChange, value }) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
    <div className="relative">
      <input
        key={name}
        type={name === 'password' || name === 'confirm' ? (showPass ? 'text' : 'password') : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={`input-dark w-full pl-10 ${name === 'password' ? 'pr-10' : 'pr-4'} py-3 rounded-xl ${errors[name] ? 'border-red-500/60' : ''}`}
      />
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      {name === 'password' && (
        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
  </div>
);

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Tên phải có ít nhất 2 ký tự';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password || form.password.length < 6) e.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu không khớp';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Đăng ký thành công! Chào mừng đến với CineStream 🎬');
      router.push('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      <div className="absolute inset-0 bg-gradient-radial from-brand-red/10 via-transparent to-transparent" />

      <div className="w-full max-w-md relative animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Film className="w-8 h-8 text-brand-red" />
            <span className="font-display text-3xl tracking-widest text-white group-hover:text-brand-red transition-colors">
              CINESTREAM
            </span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Tạo tài khoản miễn phí</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Đăng ký</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field 
              icon={User} 
              name="name" 
              placeholder="Tên của bạn" 
              label="Họ và tên" 
              showPass={showPass}
              errors={errors}
              onChange={handleChange}
              value={form.name}
            />
            <Field 
              icon={Mail} 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              label="Email" 
              showPass={showPass}
              errors={errors}
              onChange={handleChange}
              value={form.email}
            />
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  key="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  required
                  className={`input-dark w-full pl-10 pr-4 py-3 rounded-xl ${errors.password ? 'border-red-500/60' : ''}`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  key="confirm"
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className={`input-dark w-full pl-10 pr-4 py-3 rounded-xl ${errors.confirm ? 'border-red-500/60' : ''}`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-brand-red hover:text-brand-red-light font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
