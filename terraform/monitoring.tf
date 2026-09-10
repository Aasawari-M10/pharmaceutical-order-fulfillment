resource "azurerm_log_analytics_workspace" "main" { 

  name                = var.log_analytics_name 

  location            = data.azurerm_resource_group.capstone.location 

  resource_group_name = data.azurerm_resource_group.capstone.name 

 

  sku = "PerGB2018" 

 
  tags = local.common_tags 

} 

 

resource "azurerm_application_insights" "main" { 

  name                = var.application_insights_name 

  location            = data.azurerm_resource_group.capstone.location 

  resource_group_name = data.azurerm_resource_group.capstone.name 

 

  application_type = "web" 

  workspace_id     = azurerm_log_analytics_workspace.main.id 

 

  tags = local.common_tags 

} 
