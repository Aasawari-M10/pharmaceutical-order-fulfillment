resource "azurerm_service_plan" "main" { 
  name                = var.app_service_plan_name 
  resource_group_name = data.azurerm_resource_group.capstone.name 
  location            = data.azurerm_resource_group.capstone.location 
 
  os_type  = "Linux" 
  sku_name = "B1" 
 
  tags = local.common_tags 
} 
resource "azurerm_linux_web_app" "order_api" { 
  name                = var.order_api_name 
  resource_group_name = data.azurerm_resource_group.capstone.name 
  location            = data.azurerm_resource_group.capstone.location 
  service_plan_id      = azurerm_service_plan.main.id 
 
  site_config { 
    always_on = true 
 
    application_stack { 
      docker_image_name = "nginx:latest" 
    } 
}
app_settings = {
    WEBSITES_PORT = "8000"

    SQL_SERVER   = azurerm_mssql_server.main.fully_qualified_domain_name
    SQL_DATABASE = azurerm_mssql_database.orders.name

    SERVICE_BUS_NAMESPACE = azurerm_servicebus_namespace.main.name
    SERVICE_BUS_QUEUE     = azurerm_servicebus_queue.order_fulfillment.name
  }

  tags = local.common_tags
}
resource "azurerm_linux_web_app" "fulfillment_worker" {
  name                = var.fulfillment_worker_name
  resource_group_name = data.azurerm_resource_group.capstone.name
  location            = data.azurerm_resource_group.capstone.location
  service_plan_id      = azurerm_service_plan.main.id

  site_config {
    always_on = true

    application_stack {
      docker_image_name = "nginx:latest"
    }
  }

  app_settings = {
    WEBSITES_PORT = "8000"

    SQL_SERVER   = azurerm_mssql_server.main.fully_qualified_domain_name
    SQL_DATABASE = azurerm_mssql_database.orders.name

    SERVICE_BUS_NAMESPACE = azurerm_servicebus_namespace.main.name
    SERVICE_BUS_QUEUE     = azurerm_servicebus_queue.order_fulfillment.name
  }

  tags = local.common_tags
}
