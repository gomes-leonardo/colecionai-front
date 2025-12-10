export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Logo/Icon */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-textPrimary">
            Carregando...
          </h2>
          <p className="text-sm text-textSecondary">
            Aguarde um momento
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
