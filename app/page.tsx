"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, CheckCircle, ChevronDown, Download, AlertCircle, Play } from "lucide-react";

interface TestCase {
  no: string;
  url: string;
  depth1: string;
  depth2: string;
  depth3: string;
  depth4: string;
  depth5: string;
  precondition: string;
  testStep: string;
  expectedResult: string;
  result: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [expandedTcId, setExpandedTcId] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleRunTests = async () => {
    setRunningTests(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/run-tests", { method: "POST" });
      const data = await res.json();
      setTestResult(data);
      if (!data.success && data.error && !data.result) {
        console.warn("Tests failed or execution error:", data.error);
      }
    } catch (err: any) {
      alert("❌ 테스트 실행 중 오류가 발생했습니다: " + err.message);
    } finally {
      setRunningTests(false);
    }
  };

  const handleGenerateCode = async () => {
    if (testCases.length === 0) return;
    setGeneratingCode(true);
    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCases }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setCodeGenerated(true); // 코드가 성공적으로 생성되었음을 표시
      alert(`✅ 성공적으로 코드가 생성되었습니다!\n경로: ${data.filePath}\n항목수: ${data.generatedCount}개`);
    } catch (err: any) {
      alert("❌ 코드 생성 중 오류가 발생했습니다: " + err.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setTestCases([]);
    setCodeGenerated(false); // 새 테스트 케이스 분석 시 코드 생성 상태 초기화
    setTestResult(null);

    try {
      const parsedUrl = url.startsWith('http') ? url : `https://${url}`;
      setUrl(parsedUrl); // auto-fix protocol

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsedUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate test cases");
      }

      setTestCases(data.testCases);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (testCases.length === 0) return;
    
    const headers = ["No.", "URL", "1 Depth", "2 Depth", "3 Depth", "4 Depth", "5 Depth", "Pre-Condition", "Test Step", "Expected Result", "Result"];
    const rows = testCases.map(tc => [
      tc.no,
      tc.url,
      tc.depth1,
      tc.depth2,
      tc.depth3,
      tc.depth4,
      tc.depth5,
      tc.precondition,
      tc.testStep,
      tc.expectedResult,
      tc.result
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map(e => e.map(item => `"${item.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "test_cases.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center min-h-screen">
        
        {/* Header / Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            AI Powered QA Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Automated QA Generator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Instantly generate full-coverage QA test cases by simply providing a URL. 
            Our Playwright & LLM engine analyzes the page's core interactions for you.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          onSubmit={handleGenerate} 
          className="w-full max-w-3xl mb-12 relative"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
              <div className="pl-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.saucedemo.com/"
                className="w-full bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder-slate-500 focus:ring-0"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 flex items-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-12 w-full max-w-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                  <Search className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyzing Web Page...</h3>
              <p className="text-slate-400 text-center text-sm max-w-sm">
                Scraping DOM structure and interactive elements using Playwright, then crafting detailed test scenarios.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center mb-8"
            >
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <h3 className="text-lg font-medium text-red-200 mb-1">Error Generating Test Cases</h3>
              <p className="text-red-400/80 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence>
          {testCases.length > 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="w-full w-full xl:max-w-7xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-end border-b border-slate-800 pb-4 mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <CheckCircle className="text-emerald-500 w-8 h-8" />
                    Generated Test Cases
                  </h2>
                  <p className="text-slate-400 mt-2">Found {testCases.length} scenarios based on page analysis.</p>
                </div>
                <div className="flex gap-3">
                  {codeGenerated && (
                    <button 
                      onClick={handleRunTests}
                      disabled={runningTests || generatingCode}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
                    >
                      {runningTests ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
                      {runningTests ? "Running..." : "Run Tests"}
                    </button>
                  )}
                  {!codeGenerated && (
                    <button 
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
                    >
                      {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "✨"} 
                      {generatingCode ? "Generating..." : "Generate Code"}
                    </button>
                  )}
                  <button 
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-5 py-2.5 rounded-xl transition-all font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border ${
                      testResult.result?.stats?.unexpected === 0 || (!testResult.result && testResult.success)
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {testResult.result?.stats?.unexpected === 0 || (!testResult.result && testResult.success) ? (
                          <><CheckCircle className="w-6 h-6 text-emerald-500" /> Tests Completed Successfully</>
                        ) : (
                          <><AlertCircle className="w-6 h-6 text-red-500" /> Tests Failed</>
                        )}
                      </h3>
                      {testResult.gsheet && (
                        <div className={`flex items-center text-xs px-3 py-1.5 rounded-full font-medium w-fit ${testResult.gsheet.reported ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {testResult.gsheet.reported ? '📊 Saved to Google Sheets' : `⚠️ Sync Failed${testResult.gsheet.error ? ': ' + testResult.gsheet.error : ''}`}
                        </div>
                      )}
                    </div>
                    
                    {testResult.result?.stats ? (
                      <div className="flex gap-6 mb-4 text-sm font-medium bg-slate-950/50 p-4 rounded-xl">
                        <span className="text-emerald-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          Passed: {testResult.result.stats.expected}
                        </span>
                        <span className="text-red-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          Failed: {testResult.result.stats.unexpected}
                        </span>
                        <span className="text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          Skipped: {testResult.result.stats.flaky + testResult.result.stats.skipped}
                        </span>
                        <span className="text-slate-300 ml-auto">
                          Duration: {(testResult.result.stats.duration / 1000).toFixed(2)}s
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm mb-4">No structured test result available.</p>
                    )}

                    {testResult.result?.suites && (
                      (() => {
                        const failedSpecs: {title: string, error: string}[] = [];
                        
                        const traverseSuites = (suites: any[]) => {
                          suites?.forEach(suite => {
                            suite.specs?.forEach((spec: any) => {
                              if (!spec.ok) {
                                spec.tests?.forEach((test: any) => {
                                  test.results?.forEach((res: any) => {
                                    if (res.status === 'unexpected' && res.errors?.length > 0) {
                                      const errorStr = res.errors[0]?.message || res.errors[0]?.value || JSON.stringify(res.errors[0]);
                                      // 중복 추가 방지 (테스트 재시도 등이 겹칠 수 있음)
                                      if (!failedSpecs.find(f => f.title === spec.title)) {
                                        failedSpecs.push({
                                          title: spec.title,
                                          error: typeof errorStr === 'string' ? errorStr : JSON.stringify(errorStr)
                                        });
                                      }
                                    }
                                  });
                                });
                              }
                            });
                            if (suite.suites) {
                              traverseSuites(suite.suites);
                            }
                          });
                        };
                        
                        traverseSuites(testResult.result.suites);

                        if (failedSpecs.length === 0) return null;

                        return (
                          <div className="mt-6">
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Failed Tests Details</h4>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                              {failedSpecs.map((fs, i) => (
                                <div key={i} className="bg-slate-950/80 border border-red-500/20 p-4 rounded-xl">
                                  <div className="font-semibold text-red-400 text-sm mb-3">❌ {fs.title}</div>
                                  <pre className="text-[11px] text-red-300/80 whitespace-pre-wrap font-mono overflow-x-auto">
                                    {fs.error.substring(0, 800)}{fs.error.length > 800 ? '\n\n... (log truncated)' : ''}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {(!testResult.result?.suites || testResult.result?.stats?.unexpected === 0) && (testResult.error || testResult.stderr) && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Execution Log</h4>
                        <pre className="bg-slate-950 p-4 rounded-xl text-xs text-red-400 overflow-x-auto border border-red-500/10 whitespace-pre-wrap">
                          {testResult.error || testResult.stderr}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-4">
                {testCases.map((tc, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
                  >
                    <div 
                      className="p-5 cursor-pointer flex justify-between items-start"
                      onClick={() => setExpandedTcId(expandedTcId === tc.no ? null : tc.no)}
                    >
                      <div className="pr-4 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-md">
                            #{tc.no}
                          </span>
                          <div className="flex text-xs text-slate-400 gap-1 overflow-hidden whitespace-nowrap overflow-ellipsis">
                            {tc.depth1 && <span>{tc.depth1}</span>}
                            {tc.depth2 && <><span className="text-slate-600">/</span><span>{tc.depth2}</span></>}
                            {tc.depth3 && <><span className="text-slate-600">/</span><span>{tc.depth3}</span></>}
                            {tc.depth4 && <><span className="text-slate-600">/</span><span>{tc.depth4}</span></>}
                          </div>
                          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {tc.result}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-100">{tc.depth5}</h3>
                      </div>
                      <button className="text-slate-500 hover:text-white mt-1 shrink-0">
                        <ChevronDown className={`w-5 h-5 transition-transform ${expandedTcId === tc.no ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedTcId === tc.no && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-5 pb-5 border-t border-slate-800"
                        >
                          <div className="mt-4 space-y-4">
                            {tc.url && (
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">URL</h4>
                                <a href={tc.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 underline whitespace-pre-wrap break-all">{tc.url}</a>
                              </div>
                            )}

                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pre-Condition</h4>
                              <p className="text-sm text-slate-300 whitespace-pre-wrap">{tc.precondition}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Test Step</h4>
                              <p className="text-sm text-slate-300 whitespace-pre-wrap ml-1">{tc.testStep}</p>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                              <h4 className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider mb-1">Expected Result</h4>
                              <p className="text-sm text-emerald-300/90 font-medium whitespace-pre-wrap">{tc.expectedResult}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
