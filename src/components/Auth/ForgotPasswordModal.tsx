import React, {useState } from 'react'; // 👈 加上 useEffect
import api from "@/services/apiService";
import {Eye, EyeOff} from "lucide-react";
import {toast, Toaster} from 'react-hot-toast';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    modol? : "changepassword" | "forgotPassword";
}

export default function ForgotPasswordModal({
                                                isOpen,
                                                onClose,
    modol = "forgotPassword",

}: Props) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'emailSent' | 'verifying' | 'verified' | 'resetting' | 'error'>('idle');
    const [message, setMessage] = useState('');

    //密碼顯示狀態
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    //測試每個步驟用
    // useEffect(() => {
    //     if (isOpen) {
    //         // ⚠️ 暫時跳過流程，進入密碼重設階段
    //         setStatus('verified');
    //     }
    // }, [isOpen]);

    const resetForm = () => {
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setStatus('idle');
        setMessage('');
    };

    const handleSendEmail = async () => {
        setStatus('loading');
        try {
            const res = await api.post('/User/SendVerificationEmail', { email });
            if (res.status === 200) {
                setStatus('emailSent');
                setMessage('✅ 驗證信已發送，請輸入驗證碼。');
            } else {
                setStatus('error');
                setMessage(res.data.message || '發送失敗，請稍後再試。');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || '發送失敗，請確認網路連線。');
        }
    };

    const handleVerifyCode = async () => {
        setStatus('verifying');
        try {
            const res = await api.post('/User/VerifyEmailCode', { email, code });
            if (res.status === 200) {
                setStatus('verified');
                setMessage('✅ 驗證成功，請輸入新密碼');
            } else {
                setStatus('emailSent');
                setMessage(res.data.message || '驗證碼錯誤，請重新輸入。');
            }
        } catch (err: any) {
            setStatus('emailSent');
            setMessage(err.response?.data?.message || '驗證失敗，請稍後再試。');
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage('❌ 兩次輸入的密碼不一致');
            return;
        }

        if (passwordStrength.level !== 'very-strong') {
            setMessage('❌ 密碼強度不足，請依照指示提高密碼複雜度。');
            return;
        }

        setStatus('resetting');
        try {
            const res = await api.post('/User/ResetPassword', {
                email,
                newPassword
            });
            if (res.status === 200) {
                toast.success('密碼已成功重設，請使用新密碼登入！');
                setTimeout(() => {
                    resetForm();
                    onClose();
                }, 1500);
            } else {
                setStatus('verified');
                setMessage(res.data.message || '重設失敗，請稍後再試。');
            }
        } catch (err: any) {
            setStatus('verified');
            setMessage(err.response?.data?.message || '重設失敗，請稍後再試。');
        }
    };

    // 密碼強度檢查
    const getPasswordStrength = (password:any) => {
        let strength = 0;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { level: 'weak', text: '弱', color: 'bg-red-500' };
        if (strength === 3) return { level: 'medium', text: '中等', color: 'bg-yellow-500' };
        if (strength === 4) return { level: 'strong', text: '強', color: 'bg-green-500' };
        return { level: 'very-strong', text: '很強', color: 'bg-emerald-500' };
    };
    const passwordStrength = getPasswordStrength(newPassword);

    if (!isOpen) return null;

    return (
        <>
            <Toaster position="top-right" reverseOrder={false}/>
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center text-black">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                    {
                        modol == "forgotPassword" ? (
                            <h2 className="text-lg font-semibold mb-4 text-black">🔐 忘記密碼</h2>
                        ):(

                        <h2 className="text-lg font-semibold mb-4 text-black">🔐 更改密碼</h2>
                        )

                    }


                    <input
                        type="email"
                        placeholder="請輸入您的信箱"
                        className="input input-bordered w-full mb-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status !== 'idle'}
                    />

                    {(status === 'emailSent' || status === 'verifying' || status === 'verified') && (
                        <input
                            type="text"
                            placeholder="請輸入驗證碼"
                            className="input input-bordered w-full mb-3"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={status === 'verified'}
                        />
                    )}

                    {status === 'verified' && (
                        <>
                            {/* 新密碼 */}
                            <div className="mb-3">
                                <div className="relative group">
                                    <input
                                        id="password"
                                        name="password"
                                        aria-label="輸入新密碼"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="請輸入新密碼"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="input input-bordered w-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>

                                {/* 密碼強度 */}
                                {newPassword && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-slate-600">密碼強度</span>
                                            <span className={`text-xs font-semibold ${
                                                passwordStrength.level === 'weak' ? 'text-red-600' :
                                                    passwordStrength.level === 'medium' ? 'text-yellow-600' :
                                                        passwordStrength.level === 'strong' ? 'text-green-600' :
                                                            'text-emerald-600'
                                            }`}>
                                                            {passwordStrength.text}
                                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${passwordStrength.color}`}
                                                style={{
                                                    width: `${Math.min(
                                                        passwordStrength.level === 'weak' ? 25 :
                                                            passwordStrength.level === 'medium' ? 50 :
                                                                passwordStrength.level === 'strong' ? 75 : 100, 100
                                                    )}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 確認新密碼 */}
                            <div className="mb-6">
                                <div className="relative group">
                                    <input
                                        id="confirmpassword"
                                        name="confirmpassword"
                                        aria-label="再次輸入新密碼"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="確認新密碼"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input input-bordered w-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            </div>
                            {/* 🔒 密碼強度要求文字 */}
                            <p className={`text-xs mt-2 ${
                                passwordStrength.level === 'very-strong'
                                    ? 'text-green-600'
                                    : 'text-slate-500'
                            }`}>
                                密碼須包含<strong>大小寫字母、數字、特殊字元</strong>，且長度需<strong>12 字以上</strong>，才能達到「很強」的等級。
                            </p>
                        </>
                    )}

                    {message && (
                        <p className={`text-sm mb-2 ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                            {message}
                        </p>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="btn btn-ghost text-black"
                        >
                            取消
                        </button>
                        <button
                            className="btn btn-primary"
                            disabled={status === 'loading' || status === 'verifying' || status === 'resetting'}
                            onClick={
                                status === 'verified'
                                    ? handleResetPassword
                                    : status === 'emailSent'
                                        ? handleVerifyCode
                                        : handleSendEmail
                            }
                        >
                            {status === 'loading'
                                ? '發送中...'
                                : status === 'verifying'
                                    ? '驗證中...'
                                    : status === 'resetting'
                                        ? '重設中...'
                                        : status === 'verified'
                                            ? '重設密碼'
                                            : status === 'emailSent'
                                                ? '送出'
                                                : '發送驗證信'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}