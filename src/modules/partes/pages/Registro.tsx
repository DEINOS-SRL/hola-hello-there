import { useState } from 'react';
import { FileEdit, Save, Truck, User, Clock, MapPin, Fuel, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function RegistroParte() {
  const [formData, setFormData] = useState({
    equipo: '',
    operador: '',
    horaInicio: '',
    horaFin: '',
    ubicacion: '',
    kilometrajeInicio: '',
    kilometrajeFin: '',
    combustible: '',
    observaciones: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Parte diario registrado correctamente');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileEdit className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registro de Parte Diario</h1>
          <p className="text-muted-foreground text-sm">
            Complete la información del parte de hoy
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Información del equipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipo">Seleccionar Equipo</Label>
                <Select value={formData.equipo} onValueChange={(v) => setFormData({ ...formData, equipo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq-001">EQ-001 - Camión Volvo FH16</SelectItem>
                    <SelectItem value="eq-002">EQ-002 - Excavadora CAT 320</SelectItem>
                    <SelectItem value="eq-003">EQ-003 - Grúa Liebherr LTM</SelectItem>
                    <SelectItem value="eq-005">EQ-005 - Camioneta Toyota Hilux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operador">Operador</Label>
                <Select value={formData.operador} onValueChange={(v) => setFormData({ ...formData, operador: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione operador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="juan">Juan Pérez</SelectItem>
                    <SelectItem value="carlos">Carlos López</SelectItem>
                    <SelectItem value="roberto">Roberto Sánchez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Horarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora Inicio</Label>
                  <Input
                    type="time"
                    id="horaInicio"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora Fin</Label>
                  <Input
                    type="time"
                    id="horaFin"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación / Obra</Label>
                <Input
                  id="ubicacion"
                  placeholder="Ej: Obra Norte, Base Central"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kilometraje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Kilometraje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kmInicio">Km Inicio</Label>
                  <Input
                    type="number"
                    id="kmInicio"
                    placeholder="0"
                    value={formData.kilometrajeInicio}
                    onChange={(e) => setFormData({ ...formData, kilometrajeInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmFin">Km Fin</Label>
                  <Input
                    type="number"
                    id="kmFin"
                    placeholder="0"
                    value={formData.kilometrajeFin}
                    onChange={(e) => setFormData({ ...formData, kilometrajeFin: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combustible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Fuel className="h-4 w-4" />
                Combustible
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="combustible">Litros cargados</Label>
                <Input
                  type="number"
                  id="combustible"
                  placeholder="0"
                  value={formData.combustible}
                  onChange={(e) => setFormData({ ...formData, combustible: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Observaciones */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ingrese observaciones, novedades o incidentes..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Parte
          </Button>
        </div>
      </form>
    </div>
  );
}
