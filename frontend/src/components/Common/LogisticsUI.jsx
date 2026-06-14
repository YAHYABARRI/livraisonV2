import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  PackagePlus,
  Route,
  Truck,
  Warehouse,
} from 'lucide-react';

export const STATUS_FLOW = [
  {
    key: 'CREATED',
    label: 'Créé',
    shortLabel: 'Créé',
    description: 'Commande enregistrée',
    Icon: PackagePlus,
  },
  {
    key: 'ACCEPTED',
    label: 'Accepté',
    shortLabel: 'Accepté',
    description: 'Prise en charge validée',
    Icon: CheckCircle2,
  },
  {
    key: 'PICKED_UP',
    label: 'Collecté',
    shortLabel: 'Collecté',
    description: 'Colis récupéré',
    Icon: PackageCheck,
  },
  {
    key: 'IN_TRANSIT',
    label: 'En transit',
    shortLabel: 'Transit',
    description: 'En route vers le hub',
    Icon: Truck,
  },
  {
    key: 'ARRIVED_AT_HUB',
    label: 'Au centre de tri',
    shortLabel: 'Hub',
    description: 'Tri régional',
    Icon: Warehouse,
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'En livraison',
    shortLabel: 'Livraison',
    description: 'Dernier kilomètre',
    Icon: Route,
  },
  {
    key: 'DELIVERED',
    label: 'Livré',
    shortLabel: 'Livré',
    description: 'Remis au destinataire',
    Icon: CheckCircle2,
  },
];

export const STATUS_META = {
  CREATED: {
    label: 'Créé',
    tone: 'amber',
    className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/25 dark:text-amber-300 dark:ring-amber-900/50',
    dot: 'bg-amber-500',
  },
  ACCEPTED: {
    label: 'Accepté',
    tone: 'blue',
    className: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-950/35 dark:text-primary-300 dark:ring-primary-900/60',
    dot: 'bg-primary-500',
  },
  PICKED_UP: {
    label: 'Collecté',
    tone: 'teal',
    className: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:ring-teal-900/50',
    dot: 'bg-teal-500',
  },
  IN_TRANSIT: {
    label: 'En transit',
    tone: 'blue',
    className: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/50',
    dot: 'bg-blue-500',
  },
  ARRIVED_AT_HUB: {
    label: 'Centre de tri',
    tone: 'sky',
    className: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:ring-sky-900/50',
    dot: 'bg-sky-500',
  },
  OUT_FOR_DELIVERY: {
    label: 'En livraison',
    tone: 'emerald',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/50',
    dot: 'bg-emerald-500',
  },
  DELIVERED: {
    label: 'Livré',
    tone: 'green',
    className: 'bg-secondary-50 text-secondary-700 ring-secondary-200 dark:bg-secondary-950/35 dark:text-secondary-300 dark:ring-secondary-900/60',
    dot: 'bg-secondary-500',
  },
  RETURNED: {
    label: 'Retourné',
    tone: 'rose',
    className: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/50',
    dot: 'bg-rose-500',
  },
};

export const getStatusMeta = (status) => (
  STATUS_META[status] || {
    label: status || 'Indéfini',
    className: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  }
);

export const getStatusProgress = (status) => {
  const index = STATUS_FLOW.findIndex((step) => step.key === status);
  if (index < 0) return 14;
  return Math.max(14, Math.round(((index + 1) / STATUS_FLOW.length) * 100));
};

export const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} DH`;

export const formatDate = (value, options) => {
  if (!value) return 'Non planifiée';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Non planifiée';
  return date.toLocaleDateString('fr-FR', options);
};

export const StatusBadge = ({ status, compact = false }) => {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${meta.className}`}>
      <span className={`status-dot ${meta.dot}`} />
      {!compact && meta.label}
    </span>
  );
};

export const PageHeader = ({ eyebrow, title, description, icon: Icon, actions }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      {eyebrow && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-700 dark:border-primary-900/60 dark:bg-primary-950/30 dark:text-primary-300">
          {Icon && <Icon size={14} />}
          <span>{eyebrow}</span>
        </div>
      )}
      <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

const statTone = {
  blue: 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300',
  green: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-950/30 dark:text-secondary-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-300',
};

export const StatCard = ({ title, value, detail, icon: Icon, tone = 'blue', trend }) => (
  <div className="surface surface-hover p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-2 truncate text-3xl font-black text-slate-950 dark:text-white">{value}</p>
      </div>
      {Icon && (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-premium ${statTone[tone] || statTone.blue}`}>
          <Icon size={21} />
        </div>
      )}
    </div>
    {(detail || trend) && (
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-semibold dark:border-slate-800">
        <span className="truncate text-slate-500 dark:text-slate-400">{detail}</span>
        {trend && <span className="text-secondary-600 dark:text-secondary-300">{trend}</span>}
      </div>
    )}
  </div>
);

export const SectionHeader = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">{title}</h2>
      {description && <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {action}
  </div>
);

export const ProgressRoute = ({ status, fromLabel = 'Collecte', toLabel = 'Livraison', compact = false }) => {
  const progress = getStatusProgress(status);
  const delivered = status === 'DELIVERED';

  return (
    <div className={`relative overflow-hidden rounded-premium border border-slate-200 bg-slate-50 tracking-grid-bg dark:border-slate-800 dark:bg-slate-950 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="relative">
        <div className="absolute left-4 right-4 top-5 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div
          className="absolute left-4 top-5 h-1 rounded-full bg-primary-600 transition-all duration-700 ease-out"
          style={{ width: `calc(${progress}% - 2rem)` }}
        />

        <div className="relative flex items-start justify-between">
          <div className="z-10 flex flex-col items-start gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-primary-600 text-white shadow-md dark:border-slate-950">
              <PackagePlus size={16} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{fromLabel}</span>
          </div>

          <div
            className="absolute top-1 z-20 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-white shadow-lg transition-all duration-700 ease-out dark:border-slate-950"
            style={{ left: `calc(${progress}% - 1.6rem)` }}
          >
            <Truck size={15} className={delivered ? '' : 'animate-soft-pulse'} />
          </div>

          <div className="z-10 flex flex-col items-end gap-2">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-md dark:border-slate-950 ${delivered ? 'bg-secondary-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <CheckCircle2 size={16} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{toLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrackingTimeline = ({ status, logs = [] }) => {
  const currentStatusIndex = STATUS_FLOW.findIndex((step) => step.key === status);

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-5">
        {STATUS_FLOW.map((step, index) => {
          const isDone = currentStatusIndex >= index;
          const log = logs?.find((entry) => entry.status === step.key);
          const Icon = step.Icon;

          return (
            <div key={step.key} className="relative">
              <div className={`absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${isDone ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                {isDone && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <div className={`rounded-premium border p-3 transition-colors ${isDone ? 'border-primary-100 bg-primary-50/50 dark:border-primary-900/50 dark:bg-primary-950/15' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/30'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className={isDone ? 'text-primary-600 dark:text-primary-300' : 'text-slate-400'} />
                    <p className={`text-sm font-extrabold ${isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {step.label}
                    </p>
                  </div>
                  {log?.timestamp && (
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      {new Date(log.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {log?.description || step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CompactTrackingSummary = ({ parcel }) => {
  if (!parcel) return null;
  const meta = getStatusMeta(parcel.status);

  return (
    <div className="surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Colis suivi</p>
          <h3 className="mt-1 text-xl font-black text-primary-700 dark:text-primary-300">{parcel.trackingId}</h3>
        </div>
        <StatusBadge status={parcel.status} />
      </div>
      <div className="mt-4">
        <ProgressRoute status={parcel.status} compact />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div className="surface-muted p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Statut</p>
          <p className="mt-1 font-bold text-slate-900 dark:text-white">{meta.label}</p>
        </div>
        <div className="surface-muted p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destinataire</p>
          <p className="mt-1 truncate font-bold text-slate-900 dark:text-white">{parcel.recipientName}</p>
        </div>
        <div className="surface-muted p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Estimation</p>
          <p className="mt-1 font-bold text-slate-900 dark:text-white">{formatDate(parcel.estimatedDelivery)}</p>
        </div>
      </div>
    </div>
  );
};

export const EmptyPanel = ({ title, description, actionText, onAction, icon: Icon = AlertCircle }) => (
  <div className="surface flex flex-col items-center justify-center p-8 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-premium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Icon size={26} />
    </div>
    <h3 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>}
    {actionText && onAction && (
      <button onClick={onAction} className="btn-premium-primary mt-5">
        <span>{actionText}</span>
        <ArrowRight size={15} />
      </button>
    )}
  </div>
);
