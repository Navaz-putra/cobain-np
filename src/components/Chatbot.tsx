
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
}

const CHATBOT_RESPONSES = {
  en: {
    greeting: "Hello! How can I help you with COBAIN today?",
    fallback: "I'm sorry, I don't have information about that yet. Please try asking something related to COBAIN's features or how to use the platform.",
    audit: "COBAIN uses the COBIT 2019 framework for audit assessments. To start an audit, navigate to the Audit section from your dashboard and click 'Start New Audit'.",
    features: "COBAIN offers features like user & role management, assessment management, maturity level calculation, gap analysis, recommendation engine, reporting, document management and audit trails.",
    login: "You can login using the credentials provided by your administrator. If you're having trouble, please contact your system administrator.",
    result: "Audit results are visualized through charts and graphs, showing current maturity levels compared to target levels. You can export reports in various formats.",
  },
  id: {
    greeting: "Halo! Bagaimana saya bisa membantu Anda dengan COBAIN hari ini?",
    fallback: "Maaf, saya belum memiliki informasi tentang itu. Silakan coba tanyakan sesuatu yang terkait dengan fitur COBAIN atau cara menggunakan platform ini.",
    audit: "COBAIN menggunakan kerangka kerja COBIT 2019 untuk penilaian audit. Untuk memulai audit, navigasikan ke bagian Audit dari dasbor Anda dan klik 'Mulai Audit Baru'.",
    features: "COBAIN menawarkan fitur seperti manajemen pengguna & peran, manajemen penilaian, perhitungan tingkat kematangan, analisis kesenjangan, mesin rekomendasi, pelaporan, manajemen dokumen, dan jejak audit.",
    login: "Anda dapat masuk menggunakan kredensial yang disediakan oleh administrator Anda. Jika Anda mengalami masalah, silakan hubungi administrator sistem Anda.",
    result: "Hasil audit divisualisasikan melalui bagan dan grafik, menunjukkan tingkat kematangan saat ini dibandingkan dengan tingkat target. Anda dapat mengekspor laporan dalam berbagai format.",
  }
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Always use Indonesian language for the chatbot
  const language = "id";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add initial greeting message
      setMessages([
        { text: CHATBOT_RESPONSES[language].greeting, isUser: false }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Simulate chatbot response
    setTimeout(() => {
      let response = CHATBOT_RESPONSES[language].fallback;
      
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("audit") || lowerInput.includes("assess") || lowerInput.includes("nilai")) {
        response = CHATBOT_RESPONSES[language].audit;
      } else if (lowerInput.includes("feature") || lowerInput.includes("fitur")) {
        response = CHATBOT_RESPONSES[language].features;
      } else if (lowerInput.includes("login") || lowerInput.includes("masuk")) {
        response = CHATBOT_RESPONSES[language].login;
      } else if (lowerInput.includes("result") || lowerInput.includes("hasil")) {
        response = CHATBOT_RESPONSES[language].result;
      }
      
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    }, 1000);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setMinimized(false);
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  return (
    <>
      {/* Chatbot toggle button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-cobain-blue text-white p-3 rounded-full shadow-lg hover:bg-cobain-navy transition-colors z-50"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 w-[320px] sm:w-[350px] shadow-xl z-50 border border-gray-200 dark:border-gray-700">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-cobain-blue text-white rounded-t-lg">
            <CardTitle className="text-sm font-medium">
              Asisten COBAIN
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-cobain-navy"
                onClick={toggleMinimize}
              >
                <ChevronDown size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-cobain-navy"
                onClick={toggleChatbot}
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          
          {!minimized && (
            <>
              <CardContent className="p-4 h-[300px] overflow-y-auto">
                <div className="flex flex-col space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg ${
                          message.isUser
                            ? "bg-cobain-blue text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-3 border-t">
                <form
                  className="flex w-full space-x-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanyakan sesuatu tentang COBAIN..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
}
