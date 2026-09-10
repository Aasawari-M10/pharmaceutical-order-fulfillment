terraform {
  backend "azurerm" {
    resource_group_name  = "rg-capstone"
    storage_account_name = "stcapstonetfstate123"
    container_name       = "tfstate"
    key                  = "pharma-capstone.tfstate"
  }
}
