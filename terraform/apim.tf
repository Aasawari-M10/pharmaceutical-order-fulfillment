resource "azurerm_api_management" "apim" {

  name                = "apim-capstone-pharma-001"

  location            = azurerm_resource_group.rg.location

  resource_group_name = azurerm_resource_group.rg.name


  publisher_name  = "Pharmaceutical Order Fulfillment Team"

  publisher_email = "aasawarirm2004@gmail.com"


  sku_name = "Developer_1"


  tags = {

    project = "pharma-capstone"

  }

}
 
