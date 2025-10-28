'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully!');
      router.push('/');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {user.user_metadata?.full_name || 'Not provided'}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};