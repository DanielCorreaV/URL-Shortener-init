variable "website_files" {
  type = map(string)
  default = {
    "index.html" = "text/html"
    "styles.css" = "text/css"
    "app.js"     = "application/javascript"
  }
}

variable "shared_api_gateway_id" {
  type        = string
  description = "El ID del API Gateway v2 (HTTP API) compartido creado en el módulo núcleo del proyecto"
}

variable "frontend_distribution_files" {
  type = map(string)
  default = {
    "index.html" = "text/html"
    "style.css"  = "text/css"
    "app.js"     = "application/javascript"
  }
}
