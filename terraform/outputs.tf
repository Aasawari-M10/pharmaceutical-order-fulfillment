output "resource_group_name" { 

  value = data.azurerm_resource_group.capstone.name 

} 

 

 

output "application_storage_account" { 

  value = azurerm_storage_account.orders.name 

} 

 

 

output "order_documents_container" { 

  value = azurerm_storage_container.order_documents.name 

} 

output "sql_server_name" { 

  value = azurerm_mssql_server.main.name 

} 

 

 

output "sql_server_fqdn" { 

  value = azurerm_mssql_server.main.fully_qualified_domain_name 

} 

 

 

output "sql_database_name" { 

  value = azurerm_mssql_database.orders.name 

} 

 

 

output "service_bus_namespace" { 

  value = azurerm_servicebus_namespace.main.name 

} 

 

 

output "service_bus_queue" { 

  value = azurerm_servicebus_queue.order_fulfillment.name 

} 

 

 

output "order_api_hostname" {


 value = azurerm_linux_web_app.order_api.default_hostname 

} 

 

 

output "fulfillment_worker_hostname" { 

  value = azurerm_linux_web_app.fulfillment_worker.default_hostname 

} 

 

 

output "application_insights_name" { 

  value = azurerm_application_insights.main.name 

}




