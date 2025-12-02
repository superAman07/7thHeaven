'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

enum View {
    LOGIN = 'LOGIN',
    SIGNUP_STEP_1_PHONE = 'SIGNUP_STEP_1_PHONE',
    SIGNUP_STEP_2_OTP = 'SIGNUP_STEP_2_OTP',
    SIGNUP_STEP_3_PASSWORD = 'SIGNUP_STEP_3_PASSWORD',
    LOGIN_OTP = 'LOGIN_OTP'
}

interface IconProps {
    className?: string;
}

const LockIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const MailIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const PhoneIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LoaderIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const EyeIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    icon: React.ReactNode;
    endIcon?: React.ReactNode;
}

const AuthInput: React.FC<AuthInputProps> = ({ id, label, icon, endIcon, ...props }) => {
    return (
        <div className="relative">
            <label htmlFor={id} className="absolute -top-2.5 left-3 text-xs text-gray-500 bg-white px-1 z-10">
                {label}
            </label>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none">
                {icon}
            </div>
            <input
                id={id}
                name={id}
                {...props}
                className={`w-full h-14 pl-12 ${endIcon ? 'pr-12' : 'pr-4'} py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all duration-300`}
            />
            {endIcon && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    {endIcon}
                </div>
            )}
        </div>
    );
};

interface OtpInputProps {
    otp: string;
    setOtp: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ otp, setOtp }) => {
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        otpRefs.current = otpRefs.current.slice(0, 6);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtpArray = otp.split('');
        newOtpArray[index] = value;
        const newOtp = newOtpArray.join('').slice(0, 6);
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').trim().slice(0, 6);
        if (!/^[0-9]+$/.test(paste)) return;
        setOtp(paste.padEnd(6, ' '));

        paste.split('').forEach((char, index) => {
            if (otpRefs.current[index]) {
                (otpRefs.current[index] as HTMLInputElement).value = char;
            }
        });

        const lastIndex = Math.min(paste.length, 5);
        otpRefs.current[lastIndex]?.focus();
    };

    return (
        <div className="flex gap-2 sm:gap-4 justify-center" onPaste={handleOtpPaste}>
            {[...Array(6)].map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    value={otp[index] || ''}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all duration-300"
                    aria-label={`OTP digit ${index + 1}`}
                />
            ))}
        </div>
    );
};

export default function AuthPage() {
    const router = useRouter();
    const [view, setView] = useState<View>(View.LOGIN);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        const match = document.cookie.match(new RegExp('(^| )referralCode=([^;]+)'));
        if (match) {
            setReferralCode(match[2]);
        }
    }, []);

    const switchView = (newView: View) => {
        setError(null);
        setView(newView);
    };

    const getErrorMessage = (error: any): string => {
        if (axios.isAxiosError(error) && error.response) {
            const data = error.response.data;
            if (data.error?.details) {
                return Object.values(data.error.details).flat().join(' ');
            }
            return data.error?.message || 'An error occurred.';
        }
        return error.message || 'An unknown network error occurred.';
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await axios.post('/api/v1/auth/login', { identifier, password });
            toast.success('Logged in successfully!');
            router.push('/');
            router.refresh();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestSignup Otp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await axios.post('/api/v1/auth/request-otp', { fullName, email, phone });
            toast.success('OTP sent to your phone.');
            switchView(View.SIGNUP_STEP_2_OTP);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await axios.post('/api/v1/auth/verify-otp', { phone, otp });
            const { data } = response.data;

            toast.success('OTP Verified!');
            if (data.needsPasswordSetup) {
                setVerificationToken(data.verificationToken);
                switchView(View.SIGNUP_STEP_3_PASSWORD);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await axios.post('/api/v1/auth/set-password', { verificationToken, password });
            toast.success('Account created! Welcome!');
            router.push('/');
            router.refresh();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestLoginOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await axios.post('/api/v1/auth/request-login-otp', { phone });
            toast.success('OTP sent to your phone.');
            switchView(View.SIGNUP_STEP_2_OTP);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            if (axios.isAxiosError(err) && err.response?.data.error?.code === 'USER_NOT_FOUND') {
                switchView(View.SIGNUP_STEP_1_PHONE);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        const commonButtonClasses = "w-full text-white font-semibold h-12 text-lg rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#D4AF37] hover:bg-[#B8941F]";

        const passwordToggleIcon = (
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-[#D4AF37] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        );

        switch (view) {
            case View.LOGIN:
                return (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4 border-2 border-[#D4AF37]/20">
                                <LockIcon className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                            <p className="text-gray-500 mt-1">Sign in to your account</p>
                        </div>
                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <AuthInput id="identifier" label="Email or Phone" icon={<MailIcon className="w-5 h-5" />} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                            <AuthInput
                                id="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                icon={<LockIcon className="w-5 h-5" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                endIcon={passwordToggleIcon}
                            />
                            <button type="submit" disabled={isLoading} className={commonButtonClasses}>
                                {isLoading ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Signing In...</> : 'Sign In'}
                            </button>
                        </form>
                        <div className="mt-6 space-y-4 text-center text-sm">
                            <button type="button" onClick={() => switchView(View.LOGIN_OTP)} className="text-[#D4AF37] font-semibold hover:text-[#B8941F] transition-colors">Login with OTP instead</button>
                            <p className="text-gray-500">Don't have an account? <button type="button" onClick={() => switchView(View.SIGNUP_STEP_1_PHONE)} className="text-[#D4AF37] font-semibold hover:text-[#B8941F] transition-colors">Sign Up</button></p>
                        </div>
                    </>
                );
            case View.SIGNUP_STEP_1_PHONE:
                return (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4 border-2 border-[#D4AF37]/20">
                                <UserIcon className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                            <p className="text-gray-500 mt-1">Step 1 of 3: Your Information</p>
                            {referralCode && (
                                <div className="mt-3 inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                                    ✓ Referred by: <strong>{referralCode}</strong>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleRequestSignupOtp} className="space-y-6">
                            <AuthInput id="fullName" label="Full Name" icon={<UserIcon className="w-5 h-5" />} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            <AuthInput
                                id="email"
                                label="Email Address"
                                icon={<MailIcon className="w-5 h-5 text-gray-400" />}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                            />
                            <AuthInput id="phone" label="Phone Number" type="tel" icon={<PhoneIcon className="w-5 h-5" />} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            <button type="submit" disabled={isLoading} className={commonButtonClasses}>
                                {isLoading ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Sending OTP...</> : 'Send OTP'}
                            </button>
                            {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                            <p className="text-center text-gray-400">
                                Already have an account?{' '}
                                <button type="button" onClick={() => switchView(View.LOGIN)} className="font-semibold text-golden hover:underline">
                                    Login
                                </button>
                            </p>
                        </form>
                    </>
                );
            case View.SIGNUP_STEP_2_OTP:
                return (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4 border-2 border-[#D4AF37]/20">
                                <PhoneIcon className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Verify Your Phone</h1>
                            <p className="text-gray-500 mt-1">Enter the 6-digit code sent to {phone}</p>
                        </div>
                        <form onSubmit={handleVerifyOtp} className="space-y-8">
                            <OtpInput otp={otp} setOtp={setOtp} />
                            <button type="submit" disabled={isLoading || otp.length !== 6} className={commonButtonClasses}>
                                {isLoading ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Verifying...</> : 'Verify OTP'}
                            </button>
                        </form>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            Entered the wrong number? <button type="button" onClick={() => switchView(View.SIGNUP_STEP_1_PHONE)} className="text-[#D4AF37] font-semibold hover:text-[#B8941F] transition-colors">Go Back</button>
                        </div>
                    </>
                );
            case View.SIGNUP_STEP_3_PASSWORD:
                return (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4 border-2 border-[#D4AF37]/20">
                                <LockIcon className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Set Your Password</h1>
                            <p className="text-gray-500 mt-1">Step 3 of 3: Secure your new account</p>
                        </div>
                        <form onSubmit={handleSetPassword} className="space-y-6">
                            <AuthInput
                                id="newPassword"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                icon={<LockIcon className="w-5 h-5" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                endIcon={passwordToggleIcon}
                            />
                            <p className="text-xs text-gray-500 -mt-4 pl-2">Minimum 8 characters.</p>
                            <button type="submit" disabled={isLoading} className={commonButtonClasses}>
                                {isLoading ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Creating Account...</> : 'Complete Signup'}
                            </button>
                        </form>
                    </>
                );
            case View.LOGIN_OTP:
                return (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4 border-2 border-[#D4AF37]/20">
                                <PhoneIcon className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Login with OTP</h1>
                            <p className="text-gray-500 mt-1">We'll send a verification code to your phone</p>
                        </div>
                        <form onSubmit={handleRequestLoginOtp} className="space-y-6">
                            <AuthInput id="loginPhone" label="Phone Number" type="tel" icon={<PhoneIcon className="w-5 h-5" />} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            <button type="submit" disabled={isLoading} className={commonButtonClasses}>
                                {isLoading ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Sending OTP...</> : 'Send OTP'}
                            </button>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            <button type="button" onClick={() => switchView(View.LOGIN)} className="text-[#D4AF37] font-semibold hover:text-[#B8941F] transition-colors">Back to Password Login</button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg text-sm animate-fade-in">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <div key={view} className="animate-fade-in">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
