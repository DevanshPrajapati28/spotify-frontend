import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 bg-neutral-900/90 backdrop-blur-md z-10 rounded-t-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:scale-105 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:scale-105 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition"
        >
          Admin Panel
        </button>
      </div>
    </header>
  );
}
