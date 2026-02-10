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

export const formatCEP = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
};

export const formatPhone = (value: string): string => {
    const v = value.replace(/\D/g, '');
    if (v.length > 10) {
        // (11) 9 9999-9999
        return v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    } else if (v.length > 9) {
        // (11) 9999-9999
        return v.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    }
    return v;
};

export const formatCPF = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatCNPJ = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
};

export const displayDate = (value: string | Date): string => {
    if (!value) return '-';
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const displayDateTime = (value: string | Date): string => {
    if (!value) return '-';
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
