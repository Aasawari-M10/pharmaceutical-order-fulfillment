locals { 
  common_tags = { 
    project     = "pharmaceutical-order-platform" 
    environment = var.environment 
    team        = var.team 
    managed_by  = "terraform" 
  } 
} 
