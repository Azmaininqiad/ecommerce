'use client';
import { createSPAClient } from "@/components/Common/lib/supabase/client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DebugAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const testSignIn = async () => {
        setLoading(true);
        try {
            const supabase = createSPAClient();
            console.log('Testing signin with:', { email, password: '***' });

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('Result:', { data, error });

            if (error) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.success('Sign in successful!');
            }
        } catch (err: any) {
            console.error('Catch error:', err);
            toast.error(`Catch error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testSignUp = async () => {
        setLoading(true);
        try {
            const supabase = createSPAClient();
            console.log('Testing signup with:', { email, password: '***' });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            console.log('Result:', { data, error });

            if (error) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.success('Sign up successful!');
            }
        } catch (err: any) {
            console.error('Catch error:', err);
            toast.error(`Catch error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>

            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block mb-2">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter email"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter password"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={testSignIn}
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white p-2 rounded disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Test Sign In'}
                    </button>

                    <button
                        onClick={testSignUp}
                        disabled={loading}
                        className="flex-1 bg-green-500 text-white p-2 rounded disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Test Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}