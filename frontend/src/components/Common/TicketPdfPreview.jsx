import { Download, Printer, X } from 'lucide-react';

const TicketPdfPreview = ({ url, title = 'Aperçu des tickets', onClose, onDownload, onPrint }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="surface flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden text-left shadow-premium-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">PDF tickets</p>
            <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onPrint} className="btn-premium-secondary px-4 py-2" type="button">
              <Printer size={15} />
              Imprimer
            </button>
            <button onClick={onDownload} className="btn-premium-primary px-4 py-2" type="button">
              <Download size={15} />
              Télécharger PDF
            </button>
            <button onClick={onClose} className="icon-button h-9 w-9" type="button" aria-label="Fermer">
              <X size={16} />
            </button>
          </div>
        </div>
        <iframe src={url} title={title} className="h-full w-full border-0 bg-white" />
      </div>
    </div>
  );
};

export default TicketPdfPreview;
