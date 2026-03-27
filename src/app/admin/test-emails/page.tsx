'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function TestEmailsPage() {
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('siriusdanismanlik.tr@gmail.com');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ type: string; success: boolean; error?: string }[] | null>(null);

  const sendTestEmails = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/admin/test-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Hata oluştu');
      } else {
        setResults(data.results);
      }
    } catch (error) {
      alert('Bağlantı hatası');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-card rounded-2xl border p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Test Email Gönderimi
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CRON_SECRET</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Vercel'deki CRON_SECRET değeri"
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
            </div>

            <Button
              onClick={sendTestEmails}
              disabled={loading || !secret || !email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  5 Test Email Gönder
                </>
              )}
            </Button>
          </div>

          {results && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold mb-3">Sonuçlar:</h3>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    r.success ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                  }`}
                >
                  {r.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{r.type}</span>
                  {r.error && <span className="text-xs ml-auto">{r.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          CRON_SECRET: Vercel Dashboard → Settings → Environment Variables
        </p>
      </div>
    </main>
  );
}
