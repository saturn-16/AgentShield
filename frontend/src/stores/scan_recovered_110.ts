Created At: 2026-06-02T15:17:36Z
Completed At: 2026-06-02T15:17:37Z
File Path: `file:///c:/Users/Gaurav%20Kumar/Desktop/microsoft%20hackathon/agentshield-ai/frontend/src/stores/scan.ts`
Total Lines: 73
Total Bytes: 2258
Showing lines 1 to 73
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: import { create } from "zustand";
2: import { PromptScanResult, UrlScanResult, PaginatedResponse } from "@/types";
3: import { api } from "@/lib/api";
4: 
5: interface ScanState {
6:   promptResult: PromptScanResult | null;
7:   urlResult: UrlScanResult | null;
8:   isScanning: boolean;
9:   promptHistory: PromptScanResult[];
10:   urlHistory: UrlScanResult[];
11:   scanPrompt: (content: string) => Promise<PromptScanResult>;
12:   scanUrl: (url: string) => Promise<UrlScanResult>;
13:   fetchPromptHistory: (page?: number, perPage?: number) => Promise<void>;
14:   fetchUrlHistory: (page?: number, perPage?: number) => Promise<void>;
15:   clearResults: () => void;
16: }
17: 
18: export const useScanStore = create<ScanState>((set, get) => ({
19:   promptResult: null,
20:   urlResult: null,
21:   isScanning: false,
22:   promptHistory: [],
23:   urlHistory: [],
24: 
25:   clearResults: () => set({ promptResult: null, urlResult: null }),
26: 
27:   scanPrompt: async (content) => {
28:     set({ isScanning: true });
29:     try {
30:       const res = await api.post<PromptScanResult>("/prompts/scan", { content });
31:       set({ promptResult: res.data, isScanning: false });
32:       // Reload history
33:       get().fetchPromptHistory();
34:       return res.data;
35:     } catch (error) {
36:       set({ isScanning: false });
37:       throw error;
38:     }
39:   },
40: 
41:   scanUrl: async (url) => {
42:     set({ isScanning: true });
43:     try {
44:       const res = await api.post<UrlScanResult>("/urls/scan", { url });
45:       set({ urlResult: res.data, isScanning: false });
46:       // Reload history
47:       get().fetchUrlHistory();
48:       return res.data;
49:     } catch (error) {
50:       set({ isScanning: false });
51:       throw error;
52:     }
53:   },
54: 
55:   fetchPromptHistory: async (page = 1, perPage = 10) => {
56:     try {
57:       const res = await api.get<PaginatedResponse<PromptScanResult>>(`/prompts/history?page=${page}&per_page=${perPage}`);
58:       set({ promptHistory: res.data.items });
59:     } catch (error) {
60:       console.error("Failed to load prompt history:", error);
61:     }
62:   },
63: 
64:   fetchUrlHistory: async (page = 1, perPage = 10) => {
65:     try {
66:       const res = await api.get<PaginatedResponse<UrlScanResult>>(`/urls/history?page=${page}&per_page=${perPage}`);
67:       set({ urlHistory: res.data.items });
68:     } catch (error) {
69:       console.error("Failed to load URL history:", error);
70:     }
71:   }
72: }));
73: 
The above content shows the entire, complete file contents of the requested file.
