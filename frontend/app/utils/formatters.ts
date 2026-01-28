/**
 * Formats a number or string into Brazilian BRL currency string (e.g., R$ 1.234,56).
 * Handles raw input typing logic.
 */
export const formatCurrency = (value: string | number): string => {
    let v = value.toString().replace(/\D/g, ''); // Remove non-digits

    // Prevent empty
    if (!v) return '';

    // Convert to number for formatting
    v = (parseInt(v) / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

    return `R$ ${v}`;
};

/**
 * Parses a BRL currency string back to a valid float for the API (e.g., 1234.56).
 */
export const parseCurrency = (value: string): string => {
    return value.replace(/\D/g, '').replace(/(\d)(\d{2})$/, '$1.$2');
};

/**
 * Basic formatting for display purposes (API -> UI)
 * Similar to formatCurrency but doesn't assume raw integer division logic needed for typing.
 * Used for displaying values coming from the database.
 */
export const displayCurrency = (value: string | number): string => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(value));
};
