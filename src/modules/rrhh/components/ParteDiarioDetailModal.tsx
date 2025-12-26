import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Lightbulb, AlertTriangle, AlertCircle, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ImageLightbox, useImageLightbox } from '@/components/ui/image-lightbox';
import { useParteDiario } from '../hooks/usePartesDiarios';
import { 
  ESTADO_ANIMO_LABELS, 
  TIPO_NOVEDAD_LABELS,
  ESTADO_NOVEDAD_LABELS,
  type TipoNovedad 
} from '../types/partesDiarios';

interface ParteDiarioDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parteId: string;
}

export function ParteDiarioDetailModal({ open, onOpenChange, parteId }: ParteDiarioDetailModalProps) {
  const { data: parte, isLoading } = useParteDiario(parteId);
  const lightbox = useImageLightbox();

  const novedadIconMap: Record<TipoNovedad, typeof Lightbulb> = {
    mejora: Lightbulb,
    reclamo: AlertTriangle,
    incidente: AlertCircle,
    observacion: MessageSquare,
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!parte) {
    return null;
  }

  const estadoAnimo = ESTADO_ANIMO_LABELS[parte.estado_animo];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Parte del {format(new Date(parte.fecha), "d 'de' MMMM, yyyy", { locale: es })}</span>
            <span className="text-2xl">{estadoAnimo?.emoji}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado de ánimo */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-3xl">{estadoAnimo?.emoji}</span>
            <div>
              <p className="font-medium">{estadoAnimo?.label}</p>
              <p className="text-sm text-muted-foreground">Estado de ánimo del día</p>
            </div>
          </div>

          {/* Actividades */}
          <div>
            <h3 className="font-semibold mb-2">Actividades realizadas</h3>
            <p className="text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
              {parte.actividades_realizadas}
            </p>
          </div>

          {/* Observaciones */}
          {parte.observaciones_adicionales && (
            <div>
              <h3 className="font-semibold mb-2">Observaciones adicionales</h3>
              <p className="text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                {parte.observaciones_adicionales}
              </p>
            </div>
          )}

          {/* Novedades */}
          {parte.novedades && parte.novedades.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Novedades ({parte.novedades.length})</h3>
              <div className="space-y-3">
                {parte.novedades.map((novedad) => {
                  const tipoInfo = TIPO_NOVEDAD_LABELS[novedad.tipo];
                  const estadoInfo = ESTADO_NOVEDAD_LABELS[novedad.estado];
                  const Icon = novedadIconMap[novedad.tipo];

                  return (
                    <div
                      key={novedad.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${tipoInfo.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className={tipoInfo.color}>
                            {tipoInfo.label}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={estadoInfo.color}>
                          {estadoInfo.label}
                        </Badge>
                      </div>

                      <p className="text-sm">{novedad.descripcion}</p>

                      {/* Fotos */}
                      {novedad.fotos && novedad.fotos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {novedad.fotos.map((foto, index) => (
                            <img
                              key={index}
                              src={foto}
                              alt={`Foto ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => lightbox.openLightbox(novedad.fotos, index)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Respuesta supervisor */}
                      {novedad.respuesta_supervisor && (
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                          <p className="text-xs text-muted-foreground mb-1">Respuesta del supervisor:</p>
                          <p className="text-sm">{novedad.respuesta_supervisor}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <Separator />
          <div className="text-xs text-muted-foreground">
            Creado: {format(new Date(parte.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
            {parte.updated_at !== parte.created_at && (
              <> • Actualizado: {format(new Date(parte.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}</>
            )}
          </div>
        </div>
      </DialogContent>

      <ImageLightbox
        images={lightbox.images}
        initialIndex={lightbox.index}
        open={lightbox.open}
        onClose={lightbox.closeLightbox}
      />
    </Dialog>
  );
}
