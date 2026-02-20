import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (
    title: string,
    columns: string[],
    data: any[][],
    filename: string
) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('SweetStore Report', 14, 22);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 32);

    // Date
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString('pt-BR');
    doc.text(`Generated on: ${date}`, 14, 40);

    // Table
    autoTable(doc, {
        head: [columns],
        body: data,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 8 },
    });

    // Page Numbers
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }

    doc.save(`${filename}.pdf`);
};
