variable "developer_public_ip" { 
  description = "Public IP address allowed to connect to Azure SQL" 
  type        = string 
} 
 
 
resource "azurerm_mssql_firewall_rule" "developer" { 
  name             = "developer-access" 
  server_id        = azurerm_mssql_server.main.id 
  start_ip_address = var.developer_public_ip 
  end_ip_address   = var.developer_public_ip 
} 
