export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-24 h-24 relative">
        <div className="absolute inset-0 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-t-transparent border-secondary rounded-full animate-spin animation-delay-150"></div>
      </div>
      <h2 className="text-xl font-medium text-primary mt-8">Loading Homebrew Gandalf...</h2>
      <p className="text-muted-foreground mt-2">Preparing the door control system</p>
    </div>
  );
} 