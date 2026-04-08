export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pardus-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pardus-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-pardus-text">Neo</h2>
        <p className="text-pardus-text/70">Yükleniyor...</p>
      </div>
    </div>
  );
}