resource "azurerm_servicebus_namespace" "main" { 
  name                = var.service_bus_namespace_name 
  location            = data.azurerm_resource_group.capstone.location 
  resource_group_name = data.azurerm_resource_group.capstone.name 
 
  sku = "Basic" 
 
  tags = local.common_tags 
} 
 
 
resource "azurerm_servicebus_queue" "order_fulfillment" { 
  name         = var.service_bus_queue_name 
  namespace_id = azurerm_servicebus_namespace.main.id 
 
  max_delivery_count = 10 
} 
