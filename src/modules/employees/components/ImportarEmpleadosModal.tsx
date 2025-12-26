import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEmpleados } from '../hooks/useEmpleados';
import type { EmpleadoInsert } from '../types';

interface ImportarEmpleadosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

// Campos de la plantilla
const TEMPLATE_HEADERS = [
  'legajo',
  'nombre',
  'apellido',
  'dni',
  'fecha_nacimiento',
  'fecha_ingreso',
  'cargo',
  'departamento',
  'email',
  'telefono',
  'direccion',
  'estado',
];

const TEMPLATE_EXAMPLE = [
  '001',
  'Juan',
  'Pérez',
  '12345678',
  '1990-01-15',
  '2020-03-01',
  'Desarrollador',
  'Tecnología',
  'juan.perez@empresa.com',
  '+54 11 1234-5678',
  'Av. Corrientes 1234, CABA',
  'activo',
];

export function ImportarEmpleadosModal({ open, onOpenChange }: ImportarEmpleadosModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { create } = useEmpleados();

  const handleDownloadTemplate = () => {
    // Crear CSV con headers y ejemplo
    const csvContent = [
      TEMPLATE_HEADERS.join(','),
      TEMPLATE_EXAMPLE.join(','),
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_empleados.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setResult(null);
    
    // Leer y previsualizar
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      setPreviewData(data.slice(0, 6)); // Mostrar max 5 filas + header
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file || !user?.empresa_id) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      
      // Saltar header
      const rows = data.slice(1);
      const total = rows.length;
      const errors: { row: number; message: string }[] = [];
      let success = 0;
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 por header y 0-index
        
        try {
          // Validar campos requeridos
          const nombre = row[1]?.trim();
          const apellido = row[2]?.trim();
          
          if (!nombre || !apellido) {
            errors.push({ row: rowNumber, message: 'Nombre y apellido son requeridos' });
            continue;
          }
          
          // Validar estado
          const estadoRaw = row[11]?.trim().toLowerCase() || 'activo';
          const estado = ['activo', 'licencia', 'baja'].includes(estadoRaw) 
            ? estadoRaw as 'activo' | 'licencia' | 'baja'
            : 'activo';
          
          const empleado: EmpleadoInsert = {
            empresa_id: user.empresa_id,
            legajo: row[0]?.trim() || null,
            nombre,
            apellido,
            dni: row[3]?.trim() || null,
            fecha_nacimiento: row[4]?.trim() || null,
            fecha_ingreso: row[5]?.trim() || null,
            cargo: row[6]?.trim() || null,
            departamento: row[7]?.trim() || null,
            email: row[8]?.trim() || null,
            telefono: row[9]?.trim() || null,
            direccion: row[10]?.trim() || null,
            estado,
          };
          
          await create(empleado);
          success++;
        } catch (err: any) {
          errors.push({ row: rowNumber, message: err.message || 'Error desconocido' });
        }
        
        setProgress(Math.round(((i + 1) / total) * 100));
      }
      
      setResult({ success, errors });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const handleClose = (open: boolean) => {
    if (!isProcessing) {
      setFile(null);
      setPreviewData([]);
      setResult(null);
      setProgress(0);
      onOpenChange(open);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Importar Empleados
          </DialogTitle>
          <DialogDescription>
            Importa empleados desde un archivo CSV. Descarga la plantilla para ver el formato requerido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botón descargar plantilla */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">Plantilla de importación</p>
                <p className="text-xs text-muted-foreground">
                  Descarga y completa la plantilla CSV
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </div>

          {/* Selector de archivo */}
          {!result && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : 'Haz clic para seleccionar un archivo CSV'}
                </span>
              </label>

              {/* Preview de datos */}
              {previewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Vista previa</p>
                    <Badge variant="secondary">{previewData.length - 1} registros</Badge>
                  </div>
                  <ScrollArea className="h-40 border rounded-lg">
                    <div className="p-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            {previewData[0]?.slice(0, 5).map((header, i) => (
                              <th key={i} className="p-1 text-left font-medium text-muted-foreground">
                                {header}
                              </th>
                            ))}
                            {previewData[0]?.length > 5 && (
                              <th className="p-1 text-muted-foreground">...</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(1).map((row, i) => (
                            <tr key={i} className="border-b last:border-0">
                              {row.slice(0, 5).map((cell, j) => (
                                <td key={j} className="p-1 truncate max-w-[100px]">
                                  {cell || '-'}
                                </td>
                              ))}
                              {row.length > 5 && <td className="p-1">...</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importando...
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-3">
              {result.success > 0 && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {result.success} empleado(s) importado(s) correctamente
                  </AlertDescription>
                </Alert>
              )}
              
              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">{result.errors.length} error(es) encontrado(s)</p>
                    <ScrollArea className="h-24">
                      <ul className="text-xs space-y-1">
                        {result.errors.map((err, i) => (
                          <li key={i}>
                            Fila {err.row}: {err.message}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              <Button variant="outline" onClick={handleReset} className="w-full">
                Importar otro archivo
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!file || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
