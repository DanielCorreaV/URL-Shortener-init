output "app_url" {
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
  description = "URL global de producción administrada por CloudFront para acceder al ecosistema (Login + Dashboard)"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.auth_front_bucket.id
  description = "Nombre del bucket S3 donde se alojan los archivos estáticos index.html, style.css y app.js"
}