import { Inbox } from 'lucide-react';
import { EmptyPanel } from './LogisticsUI';

const EmptyState = ({ title, description, actionText, onAction }) => (
  <EmptyPanel
    icon={Inbox}
    title={title || 'Aucune donnée disponible'}
    description={description || "Il n'y a pas d'éléments à afficher pour le moment."}
    actionText={actionText}
    onAction={onAction}
  />
);

export default EmptyState;
