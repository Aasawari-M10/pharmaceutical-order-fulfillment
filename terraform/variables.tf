variable "resource_group_name" { 
  description = "Existing resource group for the pharmaceutical platform" 
  type        = string 
  default     = "rg-capstone" 
} 
 
variable "location" { 
  description = "Azure region" 
  type        = string 
  default     = "Central India" 
} 
 
variable "environment" { 
  description = "Deployment environment" 
  type        = string 
  default     = "dev" 
} 
 
variable "team" { 
  description = "Team identifier" 
  type        = string 
  default     = "team1" 
} 
 
 
# ------------------------- 
# Application Storage 
# ------------------------- 
 
variable "storage_account_name" { 
  description = "Globally unique application storage account name" 
  type        = string 
} 
 
 
# ------------------------- 
# Azure SQL 
# ------------------------- 
 
variable "sql_server_name" { 
  description = "Globally unique Azure SQL logical server name" 
  type        = string 
} 
 
variable "sql_database_name" { 
  description = "Azure SQL database name" 
  type        = string 
  default     = "MedicineOrdersDB" 
} 
 
variable "sql_admin_username" { 
  description = "Azure SQL administrator username" 
  type        = string 
  sensitive   = true 
} 
 
variable "sql_admin_password" { 
  description = "Azure SQL administrator password" 
  type        = string 
  sensitive   = true 
} 
 
 
# ------------------------- 
# Service Bus 
# ------------------------- 
 
variable "service_bus_namespace_name" { 
  description = "Globally unique Service Bus namespace" 
  type        = string 
} 
 
variable "service_bus_queue_name" { 
  description = "Service Bus queue name" 
  type        = string 
  default     = "order-fulfillment" 
} 
 
 
# ------------------------- 
# App Services 
# ------------------------- 
 
variable "app_service_plan_name" { 
  description = "App Service Plan name" 
  type        = string 
  default     = "asp-capstone-pharma" 
} 
 
variable "order_api_name" { 
  description = "Globally unique Order API App Service name" 
  type        = string 
} 
 
variable "fulfillment_worker_name" { 
  description = "Globally unique Fulfillment Worker App Service name" 
  type        = string 
} 
 
 
# ------------------------- 
# Monitoring 
# ------------------------- 
 
variable "log_analytics_name" { 
  description = "Log Analytics workspace name" 
  type        = string 
  default     = "law-capstone-pharma" 
} 
 
variable "application_insights_name" { 
  description = "Application Insights name" 
  type        = string 
  default     = "appi-capstone-pharma" 
} 
