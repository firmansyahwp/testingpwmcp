import * as XLSX from 'xlsx';

export class ExcelReader {

        // =========================================
        // READ SHEET
        // =========================================
        static readSheet(filePath: string, sheetName: string): any[] {
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                throw new Error(`Sheet '${sheetName}' not found`);
            }
            return XLSX.utils.sheet_to_json(
                sheet,
                {
                    defval: ''
                }
            );
        }

        // =========================================
        // WRITE CELL IN SPECIFIC COLUMN -> A
        // =========================================
        static updateStatus(filePath: string, sheetName: string, rowIndex: number, status: string) {
             const workbook = XLSX.readFile(filePath);
             const worksheet = workbook.Sheets[sheetName];
             const cellAddress = `A${rowIndex + 2}`;
             worksheet[cellAddress] = {
                 t: 's',
                 v: status
             };
             XLSX.writeFile(workbook, filePath);
         }   

        // =========================================
        // WRITE CELL IN ANY COLUMN
        // =========================================
        static writeCell(filePath: string, sheetName: string, cell: string, value: any) {
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[sheetName];
            sheet[cell] = {
                t: 's',
                v: String(value)
            };
            XLSX.writeFile(workbook, filePath);
        }     

}