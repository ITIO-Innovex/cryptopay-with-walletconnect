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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_front_ui: {
        Row: {
          assigned_role: string | null
          assing_client_ids: string | null
          clientid: number | null
          enabled_keys: string | null
          id: number
          theme_name: string | null
        }
        Insert: {
          assigned_role?: string | null
          assing_client_ids?: string | null
          clientid?: number | null
          enabled_keys?: string | null
          id?: number
          theme_name?: string | null
        }
        Update: {
          assigned_role?: string | null
          assing_client_ids?: string | null
          clientid?: number | null
          enabled_keys?: string | null
          id?: number
          theme_name?: string | null
        }
        Relationships: []
      }
      ai_chat_service: {
        Row: {
          answer: string | null
          confidence: number | null
          created_at: string
          human_correction: string | null
          id: number
          merchant_id: number | null
          metadata_json: string | null
          question: string | null
          sensitive_flag: boolean | null
          session_id: string | null
          source_type: string | null
          status: string
          updated_at: string | null
          user_role: string
        }
        Insert: {
          answer?: string | null
          confidence?: number | null
          created_at: string
          human_correction?: string | null
          id?: number
          merchant_id?: number | null
          metadata_json?: string | null
          question?: string | null
          sensitive_flag?: boolean | null
          session_id?: string | null
          source_type?: string | null
          status: string
          updated_at?: string | null
          user_role: string
        }
        Update: {
          answer?: string | null
          confidence?: number | null
          created_at?: string
          human_correction?: string | null
          id?: number
          merchant_id?: number | null
          metadata_json?: string | null
          question?: string | null
          sensitive_flag?: boolean | null
          session_id?: string | null
          source_type?: string | null
          status?: string
          updated_at?: string | null
          user_role?: string
        }
        Relationships: []
      }
      announcement: {
        Row: {
          acquirer: string | null
          created_at: string | null
          id: number
          is_archived: boolean | null
          message: string | null
          priority: string | null
          tags: string | null
          target_audience: string | null
          title: string | null
        }
        Insert: {
          acquirer?: string | null
          created_at?: string | null
          id?: number
          is_archived?: boolean | null
          message?: string | null
          priority?: string | null
          tags?: string | null
          target_audience?: string | null
          title?: string | null
        }
        Update: {
          acquirer?: string | null
          created_at?: string | null
          id?: number
          is_archived?: boolean | null
          message?: string | null
          priority?: string | null
          tags?: string | null
          target_audience?: string | null
          title?: string | null
        }
        Relationships: []
      }
      api_key_management: {
        Row: {
          api_key: string | null
          api_secret: string | null
          base_url: string | null
          category: string
          created_at: string | null
          created_by: string | null
          environment: string
          extra_config_json: string | null
          id: number
          is_default: boolean
          json_log_history: string | null
          mask_preview: string | null
          model_name: string | null
          project_id: string | null
          provider_name: string
          region: string | null
          remarks: string | null
          service_code: string
          status: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          base_url?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          environment: string
          extra_config_json?: string | null
          id?: number
          is_default: boolean
          json_log_history?: string | null
          mask_preview?: string | null
          model_name?: string | null
          project_id?: string | null
          provider_name: string
          region?: string | null
          remarks?: string | null
          service_code: string
          status: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          base_url?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          environment?: string
          extra_config_json?: string | null
          id?: number
          is_default?: boolean
          json_log_history?: string | null
          mask_preview?: string | null
          model_name?: string | null
          project_id?: string | null
          provider_name?: string
          region?: string | null
          remarks?: string | null
          service_code?: string
          status?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      authorized_emails: {
        Row: {
          active: number | null
          clientid: number | null
          created_date: string | null
          email: string | null
          fullname: string | null
          id: number
          primary: number | null
          role: string | null
          updated_date: string | null
          verifcode: string | null
        }
        Insert: {
          active?: number | null
          clientid?: number | null
          created_date?: string | null
          email?: string | null
          fullname?: string | null
          id?: number
          primary?: number | null
          role?: string | null
          updated_date?: string | null
          verifcode?: string | null
        }
        Update: {
          active?: number | null
          clientid?: number | null
          created_date?: string | null
          email?: string | null
          fullname?: string | null
          id?: number
          primary?: number | null
          role?: string | null
          updated_date?: string | null
          verifcode?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          action_name: string
          created_at: string
          data: Json | null
          entity_id: number | null
          id: number
          role: string
          title: string
          user_id: number
        }
        Insert: {
          action_name: string
          created_at: string
          data?: Json | null
          entity_id?: number | null
          id?: number
          role: string
          title: string
          user_id: number
        }
        Update: {
          action_name?: string
          created_at?: string
          data?: Json | null
          entity_id?: number | null
          id?: number
          role?: string
          title?: string
          user_id?: number
        }
        Relationships: []
      }
      client_info_table: {
        Row: {
          account_balance: number | null
          account_id: string | null
          account_number: string | null
          account_permissions_json: Json | null
          address: string | null
          address2: string | null
          admin_front_ui_id: number | null
          agreement_signature: string | null
          agreement_signature_color: string | null
          agreement_signature_font: string | null
          agreement_signature_method: string | null
          agreement_signed_at: string | null
          allow_admin_list: string | null
          allow_currency: string | null
          allow_merchant_list: string | null
          allow_payout: string | null
          aml_compliant: boolean | null
          auto_refresh_dashboard: boolean | null
          business_activity: string | null
          business_email: string | null
          business_type: string | null
          city: string | null
          common_bank_accounts: string | null
          compact_view: boolean | null
          company_address: string | null
          company_name: string | null
          company_registration_number: string | null
          confirm_password: string | null
          contact: string | null
          contact_number: string | null
          country: string | null
          country_of_incorporation: string | null
          danger_zone: boolean | null
          dark_mode: boolean | null
          dashboard_layout: string | null
          data_analytics: boolean | null
          data_processing: boolean | null
          data_retention: string | null
          date_of_birth: string | null
          date_of_incorporation: string | null
          dba: string | null
          default_currency: string | null
          default_language: string | null
          description: string | null
          email: string | null
          email_notifications: boolean | null
          employment_status: string | null
          enter_activity: string | null
          export_account_data: boolean | null
          first_name: string | null
          gateway_partner_id: number | null
          gdpr_compliant: boolean | null
          gender: string | null
          google_auth_secret: string | null
          host_id: number | null
          id: number
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          individual_or_corporate: string | null
          industry: string | null
          is_account_linked: string | null
          json_upload_documents: string | null
          kyc_verified: boolean | null
          last_name: string | null
          legal_name: string | null
          marketing_communications: boolean | null
          merchant_front_ui_id: number | null
          name: string | null
          nationality: string | null
          parent_id: number | null
          password: string | null
          pci_compliant: boolean | null
          pincode: string | null
          place_of_birth: string | null
          profile_complete: boolean | null
          profile_img: string | null
          profile_visibility: boolean | null
          refund_url: string | null
          reset_all_settings: boolean | null
          reset_email_sent_time: string | null
          reset_password_time: string | null
          role_in_company: string | null
          roles: string | null
          session_timeout: number | null
          show_time_display: boolean | null
          sms_notifications: boolean | null
          state: string | null
          status: string | null
          street: string | null
          sub_account_role: string | null
          support_email: string | null
          tax_id: string | null
          tc: string | null
          telegram_username: string | null
          theme_preference: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          user_name: string | null
          verify_signup_otp: string | null
          website: string | null
          weekly_summary: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          account_balance?: number | null
          account_id?: string | null
          account_number?: string | null
          account_permissions_json?: Json | null
          address?: string | null
          address2?: string | null
          admin_front_ui_id?: number | null
          agreement_signature?: string | null
          agreement_signature_color?: string | null
          agreement_signature_font?: string | null
          agreement_signature_method?: string | null
          agreement_signed_at?: string | null
          allow_admin_list?: string | null
          allow_currency?: string | null
          allow_merchant_list?: string | null
          allow_payout?: string | null
          aml_compliant?: boolean | null
          auto_refresh_dashboard?: boolean | null
          business_activity?: string | null
          business_email?: string | null
          business_type?: string | null
          city?: string | null
          common_bank_accounts?: string | null
          compact_view?: boolean | null
          company_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          confirm_password?: string | null
          contact?: string | null
          contact_number?: string | null
          country?: string | null
          country_of_incorporation?: string | null
          danger_zone?: boolean | null
          dark_mode?: boolean | null
          dashboard_layout?: string | null
          data_analytics?: boolean | null
          data_processing?: boolean | null
          data_retention?: string | null
          date_of_birth?: string | null
          date_of_incorporation?: string | null
          dba?: string | null
          default_currency?: string | null
          default_language?: string | null
          description?: string | null
          email?: string | null
          email_notifications?: boolean | null
          employment_status?: string | null
          enter_activity?: string | null
          export_account_data?: boolean | null
          first_name?: string | null
          gateway_partner_id?: number | null
          gdpr_compliant?: boolean | null
          gender?: string | null
          google_auth_secret?: string | null
          host_id?: number | null
          id?: number
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          individual_or_corporate?: string | null
          industry?: string | null
          is_account_linked?: string | null
          json_upload_documents?: string | null
          kyc_verified?: boolean | null
          last_name?: string | null
          legal_name?: string | null
          marketing_communications?: boolean | null
          merchant_front_ui_id?: number | null
          name?: string | null
          nationality?: string | null
          parent_id?: number | null
          password?: string | null
          pci_compliant?: boolean | null
          pincode?: string | null
          place_of_birth?: string | null
          profile_complete?: boolean | null
          profile_img?: string | null
          profile_visibility?: boolean | null
          refund_url?: string | null
          reset_all_settings?: boolean | null
          reset_email_sent_time?: string | null
          reset_password_time?: string | null
          role_in_company?: string | null
          roles?: string | null
          session_timeout?: number | null
          show_time_display?: boolean | null
          sms_notifications?: boolean | null
          state?: string | null
          status?: string | null
          street?: string | null
          sub_account_role?: string | null
          support_email?: string | null
          tax_id?: string | null
          tc?: string | null
          telegram_username?: string | null
          theme_preference?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          user_name?: string | null
          verify_signup_otp?: string | null
          website?: string | null
          weekly_summary?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          account_balance?: number | null
          account_id?: string | null
          account_number?: string | null
          account_permissions_json?: Json | null
          address?: string | null
          address2?: string | null
          admin_front_ui_id?: number | null
          agreement_signature?: string | null
          agreement_signature_color?: string | null
          agreement_signature_font?: string | null
          agreement_signature_method?: string | null
          agreement_signed_at?: string | null
          allow_admin_list?: string | null
          allow_currency?: string | null
          allow_merchant_list?: string | null
          allow_payout?: string | null
          aml_compliant?: boolean | null
          auto_refresh_dashboard?: boolean | null
          business_activity?: string | null
          business_email?: string | null
          business_type?: string | null
          city?: string | null
          common_bank_accounts?: string | null
          compact_view?: boolean | null
          company_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          confirm_password?: string | null
          contact?: string | null
          contact_number?: string | null
          country?: string | null
          country_of_incorporation?: string | null
          danger_zone?: boolean | null
          dark_mode?: boolean | null
          dashboard_layout?: string | null
          data_analytics?: boolean | null
          data_processing?: boolean | null
          data_retention?: string | null
          date_of_birth?: string | null
          date_of_incorporation?: string | null
          dba?: string | null
          default_currency?: string | null
          default_language?: string | null
          description?: string | null
          email?: string | null
          email_notifications?: boolean | null
          employment_status?: string | null
          enter_activity?: string | null
          export_account_data?: boolean | null
          first_name?: string | null
          gateway_partner_id?: number | null
          gdpr_compliant?: boolean | null
          gender?: string | null
          google_auth_secret?: string | null
          host_id?: number | null
          id?: number
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          individual_or_corporate?: string | null
          industry?: string | null
          is_account_linked?: string | null
          json_upload_documents?: string | null
          kyc_verified?: boolean | null
          last_name?: string | null
          legal_name?: string | null
          marketing_communications?: boolean | null
          merchant_front_ui_id?: number | null
          name?: string | null
          nationality?: string | null
          parent_id?: number | null
          password?: string | null
          pci_compliant?: boolean | null
          pincode?: string | null
          place_of_birth?: string | null
          profile_complete?: boolean | null
          profile_img?: string | null
          profile_visibility?: boolean | null
          refund_url?: string | null
          reset_all_settings?: boolean | null
          reset_email_sent_time?: string | null
          reset_password_time?: string | null
          role_in_company?: string | null
          roles?: string | null
          session_timeout?: number | null
          show_time_display?: boolean | null
          sms_notifications?: boolean | null
          state?: string | null
          status?: string | null
          street?: string | null
          sub_account_role?: string | null
          support_email?: string | null
          tax_id?: string | null
          tc?: string | null
          telegram_username?: string | null
          theme_preference?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          user_name?: string | null
          verify_signup_otp?: string | null
          website?: string | null
          weekly_summary?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      currency: {
        Row: {
          code: string | null
          flags: string | null
          icon: string | null
          id: number
          is_default: boolean | null
          name: string | null
          status: string | null
          territory: string | null
        }
        Insert: {
          code?: string | null
          flags?: string | null
          icon?: string | null
          id?: number
          is_default?: boolean | null
          name?: string | null
          status?: string | null
          territory?: string | null
        }
        Update: {
          code?: string | null
          flags?: string | null
          icon?: string | null
          id?: number
          is_default?: boolean | null
          name?: string | null
          status?: string | null
          territory?: string | null
        }
        Relationships: []
      }
      email_temp_details: {
        Row: {
          code: string | null
          email_message: string | null
          email_subject: string | null
          id: number
        }
        Insert: {
          code?: string | null
          email_message?: string | null
          email_subject?: string | null
          id?: number
        }
        Update: {
          code?: string | null
          email_message?: string | null
          email_subject?: string | null
          id?: number
        }
        Relationships: []
      }
      faq_entries: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: number
          image_url: string | null
          keywords: string | null
          question: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at: string
          id?: number
          image_url?: string | null
          keywords?: string | null
          question: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          keywords?: string | null
          question?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      flyway_schema_history: {
        Row: {
          checksum: number | null
          description: string
          execution_time: number
          installed_by: string
          installed_on: string
          installed_rank: number
          script: string
          success: boolean
          type: string
          version: string | null
        }
        Insert: {
          checksum?: number | null
          description: string
          execution_time: number
          installed_by: string
          installed_on?: string
          installed_rank: number
          script: string
          success: boolean
          type: string
          version?: string | null
        }
        Update: {
          checksum?: number | null
          description?: string
          execution_time?: number
          installed_by?: string
          installed_on?: string
          installed_rank?: number
          script?: string
          success?: boolean
          type?: string
          version?: string | null
        }
        Relationships: []
      }
      front_ui: {
        Row: {
          assing_client_ids: string | null
          clientid: number | null
          enabled_keys: string | null
          id: number
          theme_name: string | null
        }
        Insert: {
          assing_client_ids?: string | null
          clientid?: number | null
          enabled_keys?: string | null
          id?: number
          theme_name?: string | null
        }
        Update: {
          assing_client_ids?: string | null
          clientid?: number | null
          enabled_keys?: string | null
          id?: number
          theme_name?: string | null
        }
        Relationships: []
      }
      hosting_detail: {
        Row: {
          address: string | null
          contact: string | null
          email: string | null
          header_color: string | null
          id: number
          logo: string | null
          long_name: string | null
          short_name: string | null
          sidebar_color: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number
          smtp_username: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          email?: string | null
          header_color?: string | null
          id?: number
          logo?: string | null
          long_name?: string | null
          short_name?: string | null
          sidebar_color?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port: number
          smtp_username?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          email?: string | null
          header_color?: string | null
          id?: number
          logo?: string | null
          long_name?: string | null
          short_name?: string | null
          sidebar_color?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number
          smtp_username?: string | null
        }
        Relationships: []
      }
      master_transaction: {
        Row: {
          attempt_number: number | null
          available_balance: number | null
          available_rolling: number | null
          bank_processing_amount: number | null
          bank_processing_curr: string | null
          bearer_token: number | null
          bill_amt: number | null
          bill_currency: string | null
          bill_email: string | null
          bill_ip: string | null
          buy_mdr_amt: number | null
          buy_txnfee_amt: number | null
          channel_type: number | null
          connector: number | null
          created_date: string | null
          default_currency_amount: number | null
          fee_id: number | null
          fee_update_timestamp: string | null
          fullname: string | null
          gst_amt: number | null
          id: number
          immature_rolling_fund_amt: number | null
          integration_type: string | null
          is_orchestration_child: boolean | null
          mature_rolling_fund_amt: number | null
          mdr_cb_amt: number | null
          mdr_cbk1_amt: number | null
          mdr_refundfee_amt: number | null
          merid: number | null
          mop: string | null
          mop_name: string | null
          parent_trans_id: number | null
          payable_amt_of_txn: number | null
          reference: string | null
          related_transid: string | null
          remaining_balance_amt: number | null
          remark_status: number | null
          risk_ratio: string | null
          rolling_amt: number | null
          rolling_date: string | null
          rolling_delay: number | null
          runtime: number | null
          sell_mdr_amt: number | null
          sell_txnfee_amt: number | null
          settelement_date: string | null
          settelement_delay: number | null
          tdate: string | null
          terno: number | null
          trans_amt: number | null
          trans_currency: string | null
          trans_status: number | null
          trans_status_step: number | null
          trans_type: number | null
          transaction_flag: string | null
          transaction_period: string | null
          transid: number | null
        }
        Insert: {
          attempt_number?: number | null
          available_balance?: number | null
          available_rolling?: number | null
          bank_processing_amount?: number | null
          bank_processing_curr?: string | null
          bearer_token?: number | null
          bill_amt?: number | null
          bill_currency?: string | null
          bill_email?: string | null
          bill_ip?: string | null
          buy_mdr_amt?: number | null
          buy_txnfee_amt?: number | null
          channel_type?: number | null
          connector?: number | null
          created_date?: string | null
          default_currency_amount?: number | null
          fee_id?: number | null
          fee_update_timestamp?: string | null
          fullname?: string | null
          gst_amt?: number | null
          id?: number
          immature_rolling_fund_amt?: number | null
          integration_type?: string | null
          is_orchestration_child?: boolean | null
          mature_rolling_fund_amt?: number | null
          mdr_cb_amt?: number | null
          mdr_cbk1_amt?: number | null
          mdr_refundfee_amt?: number | null
          merid?: number | null
          mop?: string | null
          mop_name?: string | null
          parent_trans_id?: number | null
          payable_amt_of_txn?: number | null
          reference?: string | null
          related_transid?: string | null
          remaining_balance_amt?: number | null
          remark_status?: number | null
          risk_ratio?: string | null
          rolling_amt?: number | null
          rolling_date?: string | null
          rolling_delay?: number | null
          runtime?: number | null
          sell_mdr_amt?: number | null
          sell_txnfee_amt?: number | null
          settelement_date?: string | null
          settelement_delay?: number | null
          tdate?: string | null
          terno?: number | null
          trans_amt?: number | null
          trans_currency?: string | null
          trans_status?: number | null
          trans_status_step?: number | null
          trans_type?: number | null
          transaction_flag?: string | null
          transaction_period?: string | null
          transid?: number | null
        }
        Update: {
          attempt_number?: number | null
          available_balance?: number | null
          available_rolling?: number | null
          bank_processing_amount?: number | null
          bank_processing_curr?: string | null
          bearer_token?: number | null
          bill_amt?: number | null
          bill_currency?: string | null
          bill_email?: string | null
          bill_ip?: string | null
          buy_mdr_amt?: number | null
          buy_txnfee_amt?: number | null
          channel_type?: number | null
          connector?: number | null
          created_date?: string | null
          default_currency_amount?: number | null
          fee_id?: number | null
          fee_update_timestamp?: string | null
          fullname?: string | null
          gst_amt?: number | null
          id?: number
          immature_rolling_fund_amt?: number | null
          integration_type?: string | null
          is_orchestration_child?: boolean | null
          mature_rolling_fund_amt?: number | null
          mdr_cb_amt?: number | null
          mdr_cbk1_amt?: number | null
          mdr_refundfee_amt?: number | null
          merid?: number | null
          mop?: string | null
          mop_name?: string | null
          parent_trans_id?: number | null
          payable_amt_of_txn?: number | null
          reference?: string | null
          related_transid?: string | null
          remaining_balance_amt?: number | null
          remark_status?: number | null
          risk_ratio?: string | null
          rolling_amt?: number | null
          rolling_date?: string | null
          rolling_delay?: number | null
          runtime?: number | null
          sell_mdr_amt?: number | null
          sell_txnfee_amt?: number | null
          settelement_date?: string | null
          settelement_delay?: number | null
          tdate?: string | null
          terno?: number | null
          trans_amt?: number | null
          trans_currency?: string | null
          trans_status?: number | null
          trans_status_step?: number | null
          trans_type?: number | null
          transaction_flag?: string | null
          transaction_period?: string | null
          transid?: number | null
        }
        Relationships: []
      }
      master_transaction_additional: {
        Row: {
          authdata: string | null
          authentication_type: string | null
          authurl: string | null
          bill_address: string | null
          bill_city: string | null
          bill_country: string | null
          bill_phone: string | null
          bill_state: string | null
          bill_zip: string | null
          bin_no: number | null
          card_brand: string | null
          card_tier: string | null
          card_type: string | null
          ccno: string | null
          connector_creds_processing_final: string | null
          connector_json: string | null
          connector_payload_stage1: string | null
          connector_payload_stage2: string | null
          connector_payload_stage3: string | null
          connector_ref: string | null
          connector_response: string | null
          connector_response_stage1: string | null
          connector_response_stage2: string | null
          customer_device_type: string | null
          descriptor: string | null
          ex_month: string | null
          ex_year: string | null
          gateway: string | null
          id_ad: number
          issuing_bank: string | null
          issuing_country: string | null
          json_log_history: string | null
          json_value: string | null
          mer_note: string | null
          orchestration_attempt_count: number | null
          orchestration_json: string | null
          payload_stage1: string | null
          payload_stage2: string | null
          product_name: string | null
          return_url: string | null
          routing_channel: string | null
          rrn: string | null
          source_url: string | null
          support_note: string | null
          system_note: string | null
          trans_response: string | null
          transid_ad: number | null
          upa: string | null
          webhook_response_history_json: string | null
          webhook_response_stage1: string | null
          webhook_url: string | null
        }
        Insert: {
          authdata?: string | null
          authentication_type?: string | null
          authurl?: string | null
          bill_address?: string | null
          bill_city?: string | null
          bill_country?: string | null
          bill_phone?: string | null
          bill_state?: string | null
          bill_zip?: string | null
          bin_no?: number | null
          card_brand?: string | null
          card_tier?: string | null
          card_type?: string | null
          ccno?: string | null
          connector_creds_processing_final?: string | null
          connector_json?: string | null
          connector_payload_stage1?: string | null
          connector_payload_stage2?: string | null
          connector_payload_stage3?: string | null
          connector_ref?: string | null
          connector_response?: string | null
          connector_response_stage1?: string | null
          connector_response_stage2?: string | null
          customer_device_type?: string | null
          descriptor?: string | null
          ex_month?: string | null
          ex_year?: string | null
          gateway?: string | null
          id_ad?: number
          issuing_bank?: string | null
          issuing_country?: string | null
          json_log_history?: string | null
          json_value?: string | null
          mer_note?: string | null
          orchestration_attempt_count?: number | null
          orchestration_json?: string | null
          payload_stage1?: string | null
          payload_stage2?: string | null
          product_name?: string | null
          return_url?: string | null
          routing_channel?: string | null
          rrn?: string | null
          source_url?: string | null
          support_note?: string | null
          system_note?: string | null
          trans_response?: string | null
          transid_ad?: number | null
          upa?: string | null
          webhook_response_history_json?: string | null
          webhook_response_stage1?: string | null
          webhook_url?: string | null
        }
        Update: {
          authdata?: string | null
          authentication_type?: string | null
          authurl?: string | null
          bill_address?: string | null
          bill_city?: string | null
          bill_country?: string | null
          bill_phone?: string | null
          bill_state?: string | null
          bill_zip?: string | null
          bin_no?: number | null
          card_brand?: string | null
          card_tier?: string | null
          card_type?: string | null
          ccno?: string | null
          connector_creds_processing_final?: string | null
          connector_json?: string | null
          connector_payload_stage1?: string | null
          connector_payload_stage2?: string | null
          connector_payload_stage3?: string | null
          connector_ref?: string | null
          connector_response?: string | null
          connector_response_stage1?: string | null
          connector_response_stage2?: string | null
          customer_device_type?: string | null
          descriptor?: string | null
          ex_month?: string | null
          ex_year?: string | null
          gateway?: string | null
          id_ad?: number
          issuing_bank?: string | null
          issuing_country?: string | null
          json_log_history?: string | null
          json_value?: string | null
          mer_note?: string | null
          orchestration_attempt_count?: number | null
          orchestration_json?: string | null
          payload_stage1?: string | null
          payload_stage2?: string | null
          product_name?: string | null
          return_url?: string | null
          routing_channel?: string | null
          rrn?: string | null
          source_url?: string | null
          support_note?: string | null
          system_note?: string | null
          trans_response?: string | null
          transid_ad?: number | null
          upa?: string | null
          webhook_response_history_json?: string | null
          webhook_response_stage1?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      mcc_code: {
        Row: {
          category_key: string | null
          category_name: string | null
          category_status: boolean | null
          cdate: string | null
          comments: string | null
          id: number
          json_log_history: string | null
          mcc_code: string | null
        }
        Insert: {
          category_key?: string | null
          category_name?: string | null
          category_status?: boolean | null
          cdate?: string | null
          comments?: string | null
          id?: number
          json_log_history?: string | null
          mcc_code?: string | null
        }
        Update: {
          category_key?: string | null
          category_name?: string | null
          category_status?: boolean | null
          cdate?: string | null
          comments?: string | null
          id?: number
          json_log_history?: string | null
          mcc_code?: string | null
        }
        Relationships: []
      }
      merchant_announcement: {
        Row: {
          announcement_id: number
          delivered_at: string | null
          id: number
          is_archived: boolean | null
          is_read: boolean | null
          read: boolean | null
          user_id: number
        }
        Insert: {
          announcement_id: number
          delivered_at?: string | null
          id?: number
          is_archived?: boolean | null
          is_read?: boolean | null
          read?: boolean | null
          user_id: number
        }
        Update: {
          announcement_id?: number
          delivered_at?: string | null
          id?: number
          is_archived?: boolean | null
          is_read?: boolean | null
          read?: boolean | null
          user_id?: number
        }
        Relationships: []
      }
      merchant_referral: {
        Row: {
          created_at: string
          id: number
          merchant_id: number
          referral_code: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id?: number
          merchant_id: number
          referral_code: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: number
          merchant_id?: number
          referral_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      merchant_service_application_data: {
        Row: {
          form_type: string
          id: number
          payload: Json | null
          request_id: number
          submitted_at: string
        }
        Insert: {
          form_type: string
          id?: number
          payload?: Json | null
          request_id: number
          submitted_at: string
        }
        Update: {
          form_type?: string
          id?: number
          payload?: Json | null
          request_id?: number
          submitted_at?: string
        }
        Relationships: []
      }
      merchant_service_requests: {
        Row: {
          activated_at: string | null
          company_name: string | null
          created_at: string
          id: number
          merchant_id: number
          rejected_at: string | null
          rejection_reason: string | null
          requested_at: string
          reviewed_by_admin_id: number | null
          service_id: number
          status: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          company_name?: string | null
          created_at: string
          id?: number
          merchant_id: number
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at: string
          reviewed_by_admin_id?: number | null
          service_id: number
          status: string
          updated_at: string
        }
        Update: {
          activated_at?: string | null
          company_name?: string | null
          created_at?: string
          id?: number
          merchant_id?: number
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_by_admin_id?: number | null
          service_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mop_connector_icon: {
        Row: {
          cdate: string | null
          comments: string | null
          icon_name: string | null
          icon_type: string | null
          id: number
          mop_name: string | null
          mop_status: number | null
          mop_type: string | null
        }
        Insert: {
          cdate?: string | null
          comments?: string | null
          icon_name?: string | null
          icon_type?: string | null
          id?: number
          mop_name?: string | null
          mop_status?: number | null
          mop_type?: string | null
        }
        Update: {
          cdate?: string | null
          comments?: string | null
          icon_name?: string | null
          icon_type?: string | null
          id?: number
          mop_name?: string | null
          mop_status?: number | null
          mop_type?: string | null
        }
        Relationships: []
      }
      multi_domains_map: {
        Row: {
          admin_front_ui_id: number | null
          backend_api_domain_name: string | null
          cdate: string | null
          checkout_base_url: string | null
          cors_allowed_origins: string | null
          developer_url: string | null
          domain_brand_name: string | null
          domain_status: string | null
          domains_name: string | null
          email_api: string | null
          email_api_key_json: string | null
          favicon_file_name: string | null
          frontend_domain_name: string | null
          id: number
          logo_file_name: string | null
          main_domain_name: string | null
          merchant_front_ui_id: number | null
          otp_auth_urls: string | null
          support_email: string | null
          support_no: string | null
          udate: string | null
        }
        Insert: {
          admin_front_ui_id?: number | null
          backend_api_domain_name?: string | null
          cdate?: string | null
          checkout_base_url?: string | null
          cors_allowed_origins?: string | null
          developer_url?: string | null
          domain_brand_name?: string | null
          domain_status?: string | null
          domains_name?: string | null
          email_api?: string | null
          email_api_key_json?: string | null
          favicon_file_name?: string | null
          frontend_domain_name?: string | null
          id?: number
          logo_file_name?: string | null
          main_domain_name?: string | null
          merchant_front_ui_id?: number | null
          otp_auth_urls?: string | null
          support_email?: string | null
          support_no?: string | null
          udate?: string | null
        }
        Update: {
          admin_front_ui_id?: number | null
          backend_api_domain_name?: string | null
          cdate?: string | null
          checkout_base_url?: string | null
          cors_allowed_origins?: string | null
          developer_url?: string | null
          domain_brand_name?: string | null
          domain_status?: string | null
          domains_name?: string | null
          email_api?: string | null
          email_api_key_json?: string | null
          favicon_file_name?: string | null
          frontend_domain_name?: string | null
          id?: number
          logo_file_name?: string | null
          main_domain_name?: string | null
          merchant_front_ui_id?: number | null
          otp_auth_urls?: string | null
          support_email?: string | null
          support_no?: string | null
          udate?: string | null
        }
        Relationships: []
      }
      referral_commission: {
        Row: {
          commission_amount: number
          commission_type: string
          created_at: string
          currency: string
          id: number
          referral_id: number
          status: string
        }
        Insert: {
          commission_amount: number
          commission_type: string
          created_at: string
          currency: string
          id?: number
          referral_id: number
          status: string
        }
        Update: {
          commission_amount?: number
          commission_type?: string
          created_at?: string
          currency?: string
          id?: number
          referral_id?: number
          status?: string
        }
        Relationships: []
      }
      referral_invitation: {
        Row: {
          email: string | null
          id: number
          invite_type: string
          referrer_id: number
          sent_at: string
          status: string
        }
        Insert: {
          email?: string | null
          id?: number
          invite_type: string
          referrer_id: number
          sent_at: string
          status: string
        }
        Update: {
          email?: string | null
          id?: number
          invite_type?: string
          referrer_id?: number
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
      referral_mapping: {
        Row: {
          created_at: string
          earned_commission: number
          fraud_reason: string | null
          fraud_status: string | null
          id: number
          referred_merchant_id: number
          referred_signup_ip: string | null
          referrer_id: number
          status: string
          total_volume: number
          updated_at: string
        }
        Insert: {
          created_at: string
          earned_commission: number
          fraud_reason?: string | null
          fraud_status?: string | null
          id?: number
          referred_merchant_id: number
          referred_signup_ip?: string | null
          referrer_id: number
          status: string
          total_volume: number
          updated_at: string
        }
        Update: {
          created_at?: string
          earned_commission?: number
          fraud_reason?: string | null
          fraud_status?: string | null
          id?: number
          referred_merchant_id?: number
          referred_signup_ip?: string | null
          referrer_id?: number
          status?: string
          total_volume?: number
          updated_at?: string
        }
        Relationships: []
      }
      referral_mapping_config: {
        Row: {
          allow_self_referral: boolean
          auto_approval_limit: number | null
          block_same_device: boolean
          block_same_email: boolean
          block_same_ip: boolean
          block_same_kyc: boolean
          block_same_mobile: boolean
          commission_amount: number
          commission_frequency: string
          commission_trigger: string
          commission_type: string
          created_at: string
          currency: string
          id: number
          max_referrals_per_merchant: number | null
          maximum_commission_cap: number | null
          maximum_transactions: number | null
          maximum_volume: number | null
          maximum_withdrawal: number | null
          min_transaction_amount: number
          minimum_commission: number | null
          minimum_transactions: number | null
          minimum_volume: number | null
          minimum_withdrawal: number
          program_name: string | null
          program_status: string
          recurring_amount: number | null
          recurring_months: number | null
          referral_code_prefix: string | null
          referral_expiry_days: number
          referral_mapping_id: number
          terms_and_conditions_url: string | null
          updated_at: string
          volume_currency: string | null
          withdrawal_fee: number | null
          withdrawal_fee_type: string | null
        }
        Insert: {
          allow_self_referral: boolean
          auto_approval_limit?: number | null
          block_same_device: boolean
          block_same_email: boolean
          block_same_ip: boolean
          block_same_kyc: boolean
          block_same_mobile: boolean
          commission_amount: number
          commission_frequency: string
          commission_trigger: string
          commission_type: string
          created_at: string
          currency: string
          id?: number
          max_referrals_per_merchant?: number | null
          maximum_commission_cap?: number | null
          maximum_transactions?: number | null
          maximum_volume?: number | null
          maximum_withdrawal?: number | null
          min_transaction_amount: number
          minimum_commission?: number | null
          minimum_transactions?: number | null
          minimum_volume?: number | null
          minimum_withdrawal: number
          program_name?: string | null
          program_status: string
          recurring_amount?: number | null
          recurring_months?: number | null
          referral_code_prefix?: string | null
          referral_expiry_days: number
          referral_mapping_id: number
          terms_and_conditions_url?: string | null
          updated_at: string
          volume_currency?: string | null
          withdrawal_fee?: number | null
          withdrawal_fee_type?: string | null
        }
        Update: {
          allow_self_referral?: boolean
          auto_approval_limit?: number | null
          block_same_device?: boolean
          block_same_email?: boolean
          block_same_ip?: boolean
          block_same_kyc?: boolean
          block_same_mobile?: boolean
          commission_amount?: number
          commission_frequency?: string
          commission_trigger?: string
          commission_type?: string
          created_at?: string
          currency?: string
          id?: number
          max_referrals_per_merchant?: number | null
          maximum_commission_cap?: number | null
          maximum_transactions?: number | null
          maximum_volume?: number | null
          maximum_withdrawal?: number | null
          min_transaction_amount?: number
          minimum_commission?: number | null
          minimum_transactions?: number | null
          minimum_volume?: number | null
          minimum_withdrawal?: number
          program_name?: string | null
          program_status?: string
          recurring_amount?: number | null
          recurring_months?: number | null
          referral_code_prefix?: string | null
          referral_expiry_days?: number
          referral_mapping_id?: number
          terms_and_conditions_url?: string | null
          updated_at?: string
          volume_currency?: string | null
          withdrawal_fee?: number | null
          withdrawal_fee_type?: string | null
        }
        Relationships: []
      }
      referral_payout: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: number
          merchant_id: number
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at: string
          currency: string
          id?: number
          merchant_id: number
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: number
          merchant_id?: number
          status?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      referral_wallet: {
        Row: {
          available_balance: number
          id: number
          merchant_id: number
          pending_balance: number
          updated_at: string
        }
        Insert: {
          available_balance: number
          id?: number
          merchant_id: number
          pending_balance: number
          updated_at: string
        }
        Update: {
          available_balance?: number
          id?: number
          merchant_id?: number
          pending_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      referral_wallet_transaction: {
        Row: {
          after_balance: number
          amount: number
          before_balance: number
          created_at: string
          id: number
          reference_id: string | null
          transaction_type: string
          wallet_id: number
        }
        Insert: {
          after_balance: number
          amount: number
          before_balance: number
          created_at: string
          id?: number
          reference_id?: string | null
          transaction_type: string
          wallet_id: number
        }
        Update: {
          after_balance?: number
          amount?: number
          before_balance?: number
          created_at?: string
          id?: number
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: number
        }
        Relationships: []
      }
      services_catalog: {
        Row: {
          activation_flow_type: string
          activation_type: string
          created_at: string
          currency: string
          description: string
          display_order: number
          features: Json | null
          icon: string
          id: number
          is_active: boolean
          name: string
          price: number
          price_label: string | null
          price_type: string
          route_path: string | null
          service_category: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          activation_flow_type: string
          activation_type: string
          created_at: string
          currency: string
          description: string
          display_order: number
          features?: Json | null
          icon: string
          id?: number
          is_active: boolean
          name: string
          price: number
          price_label?: string | null
          price_type: string
          route_path?: string | null
          service_category: string
          short_description?: string | null
          slug: string
          updated_at: string
        }
        Update: {
          activation_flow_type?: string
          activation_type?: string
          created_at?: string
          currency?: string
          description?: string
          display_order?: number
          features?: Json | null
          icon?: string
          id?: number
          is_active?: boolean
          name?: string
          price?: number
          price_label?: string | null
          price_type?: string
          route_path?: string | null
          service_category?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          category: string | null
          client_id: number | null
          created_at: string | null
          id: number
          is_read: boolean | null
          message_id: string | null
          message_text: string | null
          message_text_hash: string | null
          priority: string | null
          sender_type: string | null
          status: string | null
          subject: string | null
          upload_documents: string | null
          user_name: string | null
        }
        Insert: {
          category?: string | null
          client_id?: number | null
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message_id?: string | null
          message_text?: string | null
          message_text_hash?: string | null
          priority?: string | null
          sender_type?: string | null
          status?: string | null
          subject?: string | null
          upload_documents?: string | null
          user_name?: string | null
        }
        Update: {
          category?: string | null
          client_id?: number | null
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message_id?: string | null
          message_text?: string | null
          message_text_hash?: string | null
          priority?: string | null
          sender_type?: string | null
          status?: string | null
          subject?: string | null
          upload_documents?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      terminal_report_delivery_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number
          merchant_id: number | null
          period_end: string | null
          period_start: string | null
          recipient_email: string | null
          recipient_name: string | null
          report_format: string | null
          report_type: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          terminal_id: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          merchant_id?: number | null
          period_end?: string | null
          period_start?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          report_format?: string | null
          report_type?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          terminal_id?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          merchant_id?: number | null
          period_end?: string | null
          period_start?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          report_format?: string | null
          report_type?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          terminal_id?: number | null
        }
        Relationships: []
      }
      user_account: {
        Row: {
          account_balance: number | null
          account_number: string | null
          currency: string | null
          id: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          account_balance?: number | null
          account_number?: string | null
          currency?: string | null
          id?: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          account_balance?: number | null
          account_number?: string | null
          currency?: string | null
          id?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
