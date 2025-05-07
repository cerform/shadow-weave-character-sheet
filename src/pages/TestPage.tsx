import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const TestPage: React.FC = () => {
  const [testValue, setTestValue] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize test environment
    console.log('Test page initialized');
    
    return () => {
      // Cleanup
      console.log('Test page unmounted');
    };
  }, []);

  const runTest = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const testResult = {
        id: Date.now(),
        value: testValue,
        timestamp: new Date().toISOString(),
        success: Math.random() > 0.3
      };
      
      setResults(prev => [...prev, testResult]);
      
      toast({
        title: testResult.success ? 'Test passed' : 'Test failed',
        description: `Test with value "${testValue}" ${testResult.success ? 'passed' : 'failed'}`,
        variant: testResult.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Test error',
        description: 'An error occurred while running the test',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    toast({
      title: 'Results cleared',
      description: 'All test results have been cleared',
    });
  };

  // Fix the function call that expects an argument but gets none
  const handleSomeFunction = (arg: any = {}) => {
    // Provide a default value for the argument
    console.log(arg);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter test value"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
            />
            <Button onClick={runTest} disabled={loading}>
              {loading ? 'Running...' : 'Run Test'}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Test Results</h3>
            {results.length === 0 ? (
              <p className="text-muted-foreground">No test results yet</p>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`p-2 rounded-md ${
                      result.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{result.value}</span>
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Update the function call in question on line 125 */}
          <Button onClick={() => handleSomeFunction({})}>Test Function</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-2 rounded-md overflow-auto">
            {JSON.stringify({ testValue, resultsCount: results.length }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
