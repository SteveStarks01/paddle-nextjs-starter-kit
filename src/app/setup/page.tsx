'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database, Smartphone, Settings } from 'lucide-react';

interface SetupResult {
  success: boolean;
  tables: string[];
  stats: Array<{ table_name: string; count: string }>;
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      
      if (response.ok) {
        setHealthStatus('healthy');
        setError(null);
      } else {
        setHealthStatus('unhealthy');
        setError(data.details || 'Health check failed');
      }
    } catch (err) {
      setHealthStatus('unhealthy');
      setError('Failed to connect to API');
    }
  };

  const runSetup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/setup', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        setSetupResult(data);
        setHealthStatus('healthy');
      } else {
        setError(data.details || 'Setup failed');
      }
    } catch (err) {
      setError('Failed to run setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            School Fee Platform Setup
          </h1>
          <p className="text-slate-300 text-lg">
            Configure your database and mobile money integrations
          </p>
        </div>

        {/* Health Check Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5" />
              Database Health Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Connection Status:</span>
              <div className="flex items-center gap-2">
                {healthStatus === 'healthy' && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge variant="default" className="bg-green-600">Healthy</Badge>
                  </>
                )}
                {healthStatus === 'unhealthy' && (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <Badge variant="destructive">Unhealthy</Badge>
                  </>
                )}
                {healthStatus === 'unknown' && (
                  <Badge variant="secondary">Unknown</Badge>
                )}
              </div>
            </div>
            <Button onClick={checkHealth} variant="outline" className="w-full">
              Check Database Connection
            </Button>
          </CardContent>
        </Card>

        {/* Setup Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              Database Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Initialize Drizzle ORM with your existing Supabase database and add mobile money support.
            </p>
            
            <Button 
              onClick={runSetup} 
              disabled={loading || healthStatus !== 'healthy'}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Database Setup
            </Button>

            {setupResult && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Setup Completed Successfully!</span>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Database Tables:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {setupResult.tables.map(table => (
                      <Badge key={table} variant="secondary" className="justify-start">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Table Statistics:</h4>
                  <div className="space-y-1">
                    {setupResult.stats.map(stat => (
                      <div key={stat.table_name} className="flex justify-between text-sm">
                        <span className="text-slate-300">{stat.table_name}:</span>
                        <span className="text-white">{stat.count} records</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Money Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Smartphone className="h-5 w-5" />
              Mobile Money Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">MTN Mobile Money</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• 21+ African countries</li>
                  <li>• XAF, GHS, UGX, RWF, ZMW, XOF, USD</li>
                  <li>• Real-time payment processing</li>
                </ul>
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-orange-400 font-semibold mb-2">Orange Money</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• 17+ African markets</li>
                  <li>• XAF, XOF, USD, EUR</li>
                  <li>• Secure payment verification</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Next Steps:</strong> Update your .env.local file with MTN and Orange Money API credentials to enable payment processing.
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Error:</span>
              </div>
              <p className="text-red-200 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {setupResult && (
          <div className="text-center">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}