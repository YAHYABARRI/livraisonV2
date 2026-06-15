import { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Front-end render error', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutralBg px-4 dark:bg-darkBg">
        <div className="surface max-w-lg p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-premium bg-red-50 text-red-600 dark:bg-red-950/25 dark:text-red-300">
            <AlertTriangle size={24} />
          </div>
          <h1 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Interface momentanément indisponible</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Une erreur d'affichage est survenue. Vos données et les APIs ne sont pas modifiées.
          </p>
          <button className="btn-premium-primary mt-5" type="button" onClick={() => window.location.reload()}>
            <RefreshCcw size={16} />
            Recharger
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
