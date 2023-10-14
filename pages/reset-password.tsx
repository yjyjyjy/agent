import { supabase } from "@/utils/supabase-client";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";

//Reset Password Page
export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { addToast } = useToasts();
    const router = useRouter();

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            addToast('Passwords do not match!', { appearance: 'error' });
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) {
                addToast(error.message, { appearance: 'error' });
            } else {
                addToast('Password reset successful!', { appearance: 'success' });
                router.push('/');
            }
        } catch (e) {
            addToast('An unexpected error occurred.', { appearance: 'error' });
        }
    };


    return <div>

        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">

                <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="card-body">
                        <div className="flex flex-col w-full border-opacity-50">

                            <h1 className="text-3xl font-bold">Reset Password</h1>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">New Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="password"
                                    className="input input-bordered"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Confirm Your New Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="password"
                                    className="input input-bordered"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />

                                <div className="form-control mt-2">
                                <button className="btn btn-tertiary" onClick={handleResetPassword}>Reset Password</button>
                                </div>

                            </div>


                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>

}

