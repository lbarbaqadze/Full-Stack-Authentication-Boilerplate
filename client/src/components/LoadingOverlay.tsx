export default function LoadingOverlay() {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
