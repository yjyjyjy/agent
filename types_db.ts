export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      a1_request: {
        Row: {
          apiKeyId: string | null
          aspectRatio: string | null
          completedAt: string | null
          createdAt: string | null
          endpoint: string | null
          feedOk: boolean | null
          feedScore: number | null
          id: string
          imgUrl: string | null
          imgUrlExpiration: string | null
          inferenceInfo: string | null
          inferenceParameters: string | null
          model: string | null
          moderationLabelCount: number | null
          moderationLabels: string | null
          requestParams: string | null
          status: string | null
          updatedAt: string | null
          userId: string | null
        }
        Insert: {
          apiKeyId?: string | null
          aspectRatio?: string | null
          completedAt?: string | null
          createdAt?: string | null
          endpoint?: string | null
          feedOk?: boolean | null
          feedScore?: number | null
          id: string
          imgUrl?: string | null
          imgUrlExpiration?: string | null
          inferenceInfo?: string | null
          inferenceParameters?: string | null
          model?: string | null
          moderationLabelCount?: number | null
          moderationLabels?: string | null
          requestParams?: string | null
          status?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
        Update: {
          apiKeyId?: string | null
          aspectRatio?: string | null
          completedAt?: string | null
          createdAt?: string | null
          endpoint?: string | null
          feedOk?: boolean | null
          feedScore?: number | null
          id?: string
          imgUrl?: string | null
          imgUrlExpiration?: string | null
          inferenceInfo?: string | null
          inferenceParameters?: string | null
          model?: string | null
          moderationLabelCount?: number | null
          moderationLabels?: string | null
          requestParams?: string | null
          status?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
      }
      api_key: {
        Row: {
          createdAt: string | null
          key: string
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          key: string
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          key?: string
          userId?: string | null
        }
      }
      banana_request: {
        Row: {
          createdAt: string | null
          endpoint: string | null
          id: string
          model: string | null
          modelOutputs: string | null
          status: string | null
          updatedAt: string | null
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          endpoint?: string | null
          id: string
          model?: string | null
          modelOutputs?: string | null
          status?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          endpoint?: string | null
          id?: string
          model?: string | null
          modelOutputs?: string | null
          status?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
      }
      cloud_formation_stack: {
        Row: {
          createdAt: string | null
          id: string
          instanceId: string | null
          status: string | null
          storageId: string | null
          type: string | null
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          id: string
          instanceId?: string | null
          status?: string | null
          storageId?: string | null
          type?: string | null
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          id?: string
          instanceId?: string | null
          status?: string | null
          storageId?: string | null
          type?: string | null
          userId?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
      }
      image: {
        Row: {
          createdAt: string | null
          feedOk: boolean | null
          id: string
          imgUrl: string | null
          imgUrlExpiration: string | null
          model: string | null
          requestId: string | null
          requestParams: Json | null
          seed: number | null
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          feedOk?: boolean | null
          id: string
          imgUrl?: string | null
          imgUrlExpiration?: string | null
          model?: string | null
          requestId?: string | null
          requestParams?: Json | null
          seed?: number | null
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          feedOk?: boolean | null
          id?: string
          imgUrl?: string | null
          imgUrlExpiration?: string | null
          model?: string | null
          requestId?: string | null
          requestParams?: Json | null
          seed?: number | null
          userId?: string | null
        }
      }
      image_moderation: {
        Row: {
          createdAt: string | null
          feedOk: boolean | null
          id: string
          imageModRaw: Json | null
          imageOthersFlagged: boolean | null
          imageSexual: boolean | null
          imageViolence: boolean | null
          promptModRaw: Json | null
          promptOthersFlagged: boolean | null
          promptSexual: boolean | null
          promptViolence: boolean | null
          rejectReason: string | null
        }
        Insert: {
          createdAt?: string | null
          feedOk?: boolean | null
          id: string
          imageModRaw?: Json | null
          imageOthersFlagged?: boolean | null
          imageSexual?: boolean | null
          imageViolence?: boolean | null
          promptModRaw?: Json | null
          promptOthersFlagged?: boolean | null
          promptSexual?: boolean | null
          promptViolence?: boolean | null
          rejectReason?: string | null
        }
        Update: {
          createdAt?: string | null
          feedOk?: boolean | null
          id?: string
          imageModRaw?: Json | null
          imageOthersFlagged?: boolean | null
          imageSexual?: boolean | null
          imageViolence?: boolean | null
          promptModRaw?: Json | null
          promptOthersFlagged?: boolean | null
          promptSexual?: boolean | null
          promptViolence?: boolean | null
          rejectReason?: string | null
        }
      }
      instance: {
        Row: {
          createdAt: string | null
          gradioLink: string | null
          id: string
          ip: string | null
          launchTemplateId: string | null
          stackId: string | null
          status: string | null
          storage: string | null
          updatedAt: string | null
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          gradioLink?: string | null
          id: string
          ip?: string | null
          launchTemplateId?: string | null
          stackId?: string | null
          status?: string | null
          storage?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          gradioLink?: string | null
          id?: string
          ip?: string | null
          launchTemplateId?: string | null
          stackId?: string | null
          status?: string | null
          storage?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
      }
      recipe: {
        Row: {
          aspectRatio: string | null
          createdAt: string | null
          id: string
          recipe: Json | null
          sdCheckpoint: string | null
          sdModelId: string | null
          userId: string | null
        }
        Insert: {
          aspectRatio?: string | null
          createdAt?: string | null
          id: string
          recipe?: Json | null
          sdCheckpoint?: string | null
          sdModelId?: string | null
          userId?: string | null
        }
        Update: {
          aspectRatio?: string | null
          createdAt?: string | null
          id?: string
          recipe?: Json | null
          sdCheckpoint?: string | null
          sdModelId?: string | null
          userId?: string | null
        }
      }
      request_logs: {
        Row: {
          data: Json | null
          event: string | null
          id: string
          ts: string | null
        }
        Insert: {
          data?: Json | null
          event?: string | null
          id: string
          ts?: string | null
        }
        Update: {
          data?: Json | null
          event?: string | null
          id?: string
          ts?: string | null
        }
      }
      sd_model_checkpoint: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          nsfw: boolean | null
          webLink: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          nsfw?: boolean | null
          webLink?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          nsfw?: boolean | null
          webLink?: string | null
        }
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
