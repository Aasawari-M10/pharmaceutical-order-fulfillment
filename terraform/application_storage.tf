resource "azurerm_storage_account" "orders" { 
  name                     = var.storage_account_name 
  resource_group_name      = data.azurerm_resource_group.capstone.name 
  location                 = data.azurerm_resource_group.capstone.location 
 
  account_tier             = "Standard" 
  account_replication_type = "LRS" 
 
  min_tls_version               = "TLS1_2" 
  allow_nested_items_to_be_public = false 
  public_network_access_enabled = true 
 
  tags = local.common_tags 
} 
 
 
resource "azurerm_storage_container" "order_documents" { 
  name                  = "order-documents" 
  storage_account_id    = azurerm_storage_account.orders.id 
  container_access_type = "private" 
} 
