export interface CompanyData {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
}

export const fetchCompanyByCNPJ = async (cnpj: string): Promise<CompanyData | null> => {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) return null;

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);

        if (!response.ok) return null;

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('CNPJ Fetch Error:', error);
        return null;
    }
};
