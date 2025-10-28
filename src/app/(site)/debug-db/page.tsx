'use client';
import React, { useEffect, useState } from 'react';

export default function DebugDBPage() {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [orderTest, setOrderTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testingOrder, setTestingOrder] = useState(false);

  useEffect(() => {
    const testDB = async () => {
      try {
        const response = await fetch('/api/test-db');
        const data = await response.json();
        setDbStatus(data);
      } catch (error) {
        setDbStatus({ success: false, error: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };

    testDB();
  }, []);

  const testOrderCreation = async () => {
    setTestingOrder(true);
    try {
      // Get auth token (this is a simplified approach)
      const response = await fetch('/api/test-order-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In a real app, you'd get this from your auth context
          'Authorization': 'Bearer ' + (localStorage.getItem('supabase.auth.token') || '')
        }
      });
      const data = await response.json();
      setOrderTest(data);
    } catch (error) {
      setOrderTest({ success: false, error: (error as Error).message });
    } finally {
      setTestingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p>Testing database connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test Results</h2>
          
          {dbStatus?.success ? (
            <div className="space-y-4">
              {Object.entries(dbStatus.tables).map(([tableName, tableInfo]: [string, any]) => (
                <div key={tableName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg capitalize">{tableName} Table</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tableInfo.exists 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tableInfo.exists ? 'EXISTS' : 'MISSING'}
                    </span>
                  </div>
                  
                  {tableInfo.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <p className="text-red-700 text-sm">
                        <strong>Error:</strong> {tableInfo.error}
                      </p>
                    </div>
                  )}
                  
                  {tableInfo.exists && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-green-700 text-sm">
                        ✅ Table is accessible and ready to use
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-medium text-red-800 mb-2">Database Connection Failed</h3>
              <p className="text-red-700">{dbStatus?.error}</p>
            </div>
          )}
        </div>

        {dbStatus?.success && !dbStatus.tables.orders.exists && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-medium text-yellow-800 mb-4">⚠️ Orders Table Missing</h3>
            <p className="text-yellow-700 mb-4">
              The orders table doesnt exist yet. You need to run the SQL migration to create it.
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <p className="mb-2"># Steps to fix:</p>
              <p>1. Go to your Supabase Dashboard</p>
              <p>2. Navigate to SQL Editor</p>
              <p>3. Run the contents of supabase_1.sql</p>
              <p>4. Refresh this page to test again</p>
            </div>
          </div>
        )}

        {/* Order Creation Test */}
        {dbStatus?.success && dbStatus.tables.orders.exists && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-800 mb-4">🧪 Test Order Creation</h3>
            <p className="text-blue-700 mb-4">
              Test if you can actually create orders (this tests RLS policies and permissions).
            </p>
            
            <button
              onClick={testOrderCreation}
              disabled={testingOrder}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {testingOrder ? 'Testing...' : 'Test Order Creation'}
            </button>

            {orderTest && (
              <div className="mt-4 p-4 bg-white rounded border">
                <h4 className="font-medium mb-2">Test Results:</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(orderTest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Test
          </button>
          
          <button
            onClick={() => {
              setDbStatus(null);
              setOrderTest(null);
              setLoading(true);
              window.location.reload();
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset All Tests
          </button>
        </div>
      </div>
    </div>
  );
}