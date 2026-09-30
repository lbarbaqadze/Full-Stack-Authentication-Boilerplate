interface ErrorOverlayProps {
    reset: () => void;
  } 
  
  export default function ErrorOverlay({ reset }: ErrorOverlayProps) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-gray-600 mb-6 max-w-sm">
          We encountered an unexpected error. Please try again to continue.
        </p>
        <button
          onClick={reset}
          className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }
