'use client';
import { createSPAClient } from "@/components/Common/lib/supabase/client";
import { useEffect, useState } from "react";

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createSPAClient();
        console.log('Supabase client:', supabase);
        
        // Test the connection by getting the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Connection error:', error);
          setConnectionStatus(`Error: ${error.message}`);
        } else {
          console.log('Connection successful:', data);
          setConnectionStatus('✅ Connected to Supabase successfully!');
        }
      } catch (error: any) {
        console.error('Test error:', error);
        setConnectionStatus(`❌ Connection failed: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Supabase Connection Test</h3>
      <p>{connectionStatus}</p>
    </div>
  );
}