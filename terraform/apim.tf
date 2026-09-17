resource "azurerm_api_management" "apim" {

  name                = var.apim_name


  location            = data.azurerm_resource_group.capstone.location


  resource_group_name = data.azurerm_resource_group.capstone.name


  publisher_name      = var.publisher_name

  publisher_email     = var.publisher_email


  sku_name = "Developer_1"

}
