import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testSupabaseConnection } from "@/utils/testSupabaseConnection";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

export const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    const testResults = await testSupabaseConnection();
    setResults(testResults);
    setTesting(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Supabase Connection Test</h3>
          <p className="text-sm text-muted-foreground">
            Test your Supabase connection and configuration
          </p>
        </div>
        <Button onClick={runTest} disabled={testing} variant="outline">
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Environment Variables */}
          <div>
            <h4 className="text-sm font-medium mb-2">Environment Variables</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>VITE_SUPABASE_URL:</span>
                <Badge variant={results.details.env?.url === "✅ Set" ? "default" : "destructive"}>
                  {results.details.env?.url || "Not checked"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>VITE_SUPABASE_PUBLISHABLE_KEY:</span>
                <Badge variant={results.details.env?.key === "✅ Set" ? "default" : "destructive"}>
                  {results.details.env?.key || "Not checked"}
                </Badge>
              </div>
              {results.details.env?.urlValue && (
                <p className="text-xs text-muted-foreground">
                  URL: {results.details.env.urlValue}
                </p>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div>
            <h4 className="text-sm font-medium mb-2">Connection Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Database Connection:</span>
                {results.connection ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Failed</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Authentication Service:</span>
                {results.auth ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Failed</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Database Tables:</span>
                {results.database ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Accessible</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Not accessible</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Status */}
          {results.details.tables && (
            <div>
              <h4 className="text-sm font-medium mb-2">Table Access</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(results.details.tables).map(([table, exists]) => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="font-mono">{table}:</span>
                    {exists ? (
                      <Badge variant="default" className="text-xs">✅</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">❌</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RPC Functions */}
          {results.details.rpc && (
            <div>
              <h4 className="text-sm font-medium mb-2">RPC Functions</h4>
              <p className="text-sm">{results.details.rpc}</p>
            </div>
          )}

          {/* Errors */}
          {results.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-destructive">Errors</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                {results.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Status:</span>
              {results.connection && results.auth ? (
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  Connection Successful
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-2">
                  <XCircle className="w-3 h-3" />
                  Connection Failed
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {!results && !testing && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Click "Test Connection" to check your Supabase setup</p>
        </div>
      )}
    </Card>
  );
};

