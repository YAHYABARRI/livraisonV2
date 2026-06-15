import BrandLogo from './BrandLogo';

const LoadingScreen = ({ label = 'Chargement de la plateforme...' }) => (
  <div className="flex min-h-screen items-center justify-center bg-neutralBg px-4 dark:bg-darkBg">
    <div className="surface flex w-full max-w-sm flex-col items-center gap-5 p-8 text-center">
      <BrandLogo variant="auto" />
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

export default LoadingScreen;
