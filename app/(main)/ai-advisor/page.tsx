'use client';

import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import AIChat from "./_components/ai-chat-simple";
import { Bot, Sparkles, LineChart } from "lucide-react";

// Import AI chat styles
import './ai-chat.css';

export default function AIAdvisorPage() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-start space-y-2">
        <h1 className="text-6xl font-bold tracking-tight gradient-title">
          Ask Me..
        </h1>
        <p className="text-sm text-gray-600">
          Get personalized financial insights powered by AI
        </p>
      </div>
      
      <div className="mb-8">
        <Tabs defaultValue="chat" className="w-full">
          

          <TabsContent value="chat" className="w-full pt-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                  <p className="text-gray-500">Loading AI chat...</p>
                </div>
              </div>
            }>
              <div className="max-w-4xl mx-auto w-full">
                <AIChat />
              </div>
            </Suspense>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  );
}