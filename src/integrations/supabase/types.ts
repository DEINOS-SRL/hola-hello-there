export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      seg_aplicaciones: {
        Row: {
          activa: boolean | null
          created_at: string | null
          descripcion: string | null
          icono: string | null
          id: string
          link_documentos: string | null
          nombre: string
          prd_documento: string | null
          repositorio: string | null
          ruta: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          link_documentos?: string | null
          nombre: string
          prd_documento?: string | null
          repositorio?: string | null
          ruta?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          link_documentos?: string | null
          nombre?: string
          prd_documento?: string | null
          repositorio?: string | null
          ruta?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seg_empresas: {
        Row: {
          created_at: string | null
          direccion: string | null
          horarios: string | null
          id: string
          nombre: string
          servicios: Json | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          direccion?: string | null
          horarios?: string | null
          id?: string
          nombre: string
          servicios?: Json | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          direccion?: string | null
          horarios?: string | null
          id?: string
          nombre?: string
          servicios?: Json | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      seg_permisos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          modulo: string | null
          nombre: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          modulo?: string | null
          nombre: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          modulo?: string | null
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seg_publicaciones: {
        Row: {
          autor_id: string | null
          contenido: string
          created_at: string | null
          empresa_id: string | null
          id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          contenido: string
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          contenido?: string
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publicaciones_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "seg_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicaciones_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "seg_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      seg_rol_permiso: {
        Row: {
          permiso_id: string
          rol_id: string
        }
        Insert: {
          permiso_id: string
          rol_id: string
        }
        Update: {
          permiso_id?: string
          rol_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rol_permiso_permiso_id_fkey"
            columns: ["permiso_id"]
            isOneToOne: false
            referencedRelation: "seg_permisos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rol_permiso_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "seg_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      seg_roles: {
        Row: {
          created_at: string | null
          descripcion: string | null
          empresa_id: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "seg_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      seg_usuario_rol: {
        Row: {
          aplicacion_id: string
          created_at: string | null
          rol_id: string
          usuario_id: string
        }
        Insert: {
          aplicacion_id: string
          created_at?: string | null
          rol_id: string
          usuario_id: string
        }
        Update: {
          aplicacion_id?: string
          created_at?: string | null
          rol_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_rol_aplicacion_id_fkey"
            columns: ["aplicacion_id"]
            isOneToOne: false
            referencedRelation: "seg_aplicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_rol_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "seg_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_rol_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "seg_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      seg_usuarios: {
        Row: {
          activo: boolean | null
          apellido: string | null
          created_at: string | null
          direccion: string | null
          dni: string | null
          email: string
          empresa_id: string | null
          id: string
          nombre: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido?: string | null
          created_at?: string | null
          direccion?: string | null
          dni?: string | null
          email: string
          empresa_id?: string | null
          id?: string
          nombre?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string | null
          created_at?: string | null
          direccion?: string | null
          dni?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nombre?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "seg_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_empresa_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
