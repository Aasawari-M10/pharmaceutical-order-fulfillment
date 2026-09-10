resource "azurerm_mssql_server" "main" { 
  name                         = var.sql_server_name 
  resource_group_name          = data.azurerm_resource_group.capstone.name 
  location                     = data.azurerm_resource_group.capstone.location 
 
  version                      = "12.0" 
  administrator_login          = var.sql_admin_username 
  administrator_login_password = var.sql_admin_password 
 
  minimum_tls_version = "1.2" 
 
  public_network_access_enabled = true 
 
  tags = local.common_tags 
} 
 
 
resource "azurerm_mssql_database" "orders" { 
  name      = var.sql_database_name 
  server_id = azurerm_mssql_server.main.id 
 
  sku_name = "S0" 
 
  tags = local.common_tags 
} 
