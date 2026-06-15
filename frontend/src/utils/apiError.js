export const getApiErrorMessage = (
  error,
  fallback = "Une erreur est survenue. Vérifiez votre connexion puis réessayez."
) => {
  const payload = error?.response?.data;

  if (payload?.errors && typeof payload.errors === 'object') {
    return Object.values(payload.errors).filter(Boolean).join(' ');
  }

  if (payload?.message) return payload.message;
  if (payload?.error) return payload.error;
  if (error?.code === 'ERR_NETWORK') {
    return "API inaccessible. Vérifiez que le backend est démarré et que l'URL API est correcte.";
  }

  return fallback;
};
