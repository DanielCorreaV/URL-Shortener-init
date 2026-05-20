
# SHRTN — Gateway Identity Frontend (`url-shortener-init`)

Este módulo aloja la interfaz web del **Portal de Autenticación Centralizado** del ecosistema SHRTN. Desarrollado como una Single Page Application (SPA) estática de alta velocidad utilizando JavaScript nativo y Tailwind CSS, este componente sirve como el único punto de entrada para el registro de nuevos usuarios y la validación de identidades.

---

## 🔐 Lógica de Autenticación y Delegación de Sesión

El cliente gestiona el flujo de control de sesiones e interoperabilidad entre dominios mediante las siguientes mecánicas:

* **Gestión de Estado de Formulario Dual:** Alterna fluidamente entre los flujos de `Login` y `Register` modificando interactivamente los layouts del DOM mediante selectores nativos, apuntando de forma dinámica a los endpoints correspondientes de la API Gateway (`/login` o `/register`).
* **Autenticación e Intercambio Seguro de Tokens:** Al procesar un inicio de sesión válido, la aplicación captura el **JSON Web Token (JWT)** devuelto por AWS Lambda, almacena las variables de sesión locales y ejecuta un mecanismo de redirección inter-módulos.
* **Inyección Transaccional de Credenciales:** Redirige al usuario hacia la consola del acortador (`SHORTEN_FRONTEND_URL`) serializando de forma segura los parámetros de identidad a través de la URI (`?token=${secureToken}&username=${secureUser}`), permitiendo que los frontends hermanos hereden la sesión de forma transparente.

---

## 📂 Estructura del Módulo

Distribución de los recursos del portal de acceso y sus manifiestos de automatización:

```text
C:\CODE PROJECTS\URL-SHORTENER\MODULES\FRONTEND\URL-SHORTENER-INIT
│   .env                      <-- Parámetros de entorno locales
│   .gitignore
│   package-lock.json
│   package.json              <-- Dependencias de desarrollo
│   README.md                 <-- (Este archivo)
│
├───src                       <-- ARTEFACTOS DEL PORTAL WEB
│       app.js                <-- Manejador de llamadas asíncronas, cifrado URI y alternancia de pestañas
│       index.html            <-- Maquetación del login, registro y alertas reactivas
│       style.css             <-- Capa estética basada en utilidades de Tailwind CSS
│
└───terraform                 <-- CAPA DE INFRAESTRUCTURA DE RED
        main.tf               <-- Definición de S3 Bucket, reglas de Origin Access Control (OAC) y CDN
        outputs.tf
        providers.tf
        terraform.tfstate
        terraform.tfstate.backup
        terraform.tfvars
        variables.tf

```

---

## 🌐 Aprovisionamiento y Distribución en la Nube

Para garantizar la disponibilidad global y mitigar problemas de latencia durante la carga inicial, el aprovisionamiento de `/terraform` levanta una arquitectura serverless desacoplada de almacenamiento:

* **Amazon S3 Bucket:** Almacena de forma segura los binarios y recursos públicos (`index.html`, `app.js`, `style.css`), manteniendo políticas restrictivas que prohíben el tráfico directo de internet.
* **Amazon CloudFront:** Funciona como la red perimetral (**CDN**). Utilizando *Origin Access Control (OAC)*, CloudFront lee de forma segura desde S3 y distribuye las vistas a través de la infraestructura global de AWS, manejando la cacheación y el cifrado SSL/TLS de forma nativa.

---

## ⚙️ Constantes de Integración del Ecosistema

La configuración de endpoints en `src/app.js` conecta este portal con las capas lógicas y de negocio:

| Constante | Propósito | URL de Destino |
| --- | --- | --- |
| `API_BASE_URL` | Endpoint de la API Gateway para llamadas REST de backend. | `https://jguawzn6ka.execute-api.us-east-1.amazonaws.com` |
| `SHORTEN_FRONTEND_URL` | URL CloudFront correspondiente a la interfaz del Dashboard principal. | `https://de7c8fkkejed4.cloudfront.net` |

---

## 🚀 Despliegue de la Interfaz

1. **Configurar punteros del entorno:**
Abre `src/app.js` y valida que las variables `API_BASE_URL` y `SHORTEN_FRONTEND_URL` correspondan con los recursos desplegados en tu cuenta cloud.
2. **Inicializar y Aplicar Terraform:**
Múdate al directorio de infraestructura para aprovisionar los servicios de red de AWS de forma automatizada:
```bash
cd terraform
terraform init
terraform apply

```


3. **Sincronizar Artefactos:**
Una vez que el comando finalice y provea los outputs, transfiere los archivos contenidos en la carpeta `/src` hacia el bucket S3 asignado. A partir de ese momento, el portal quedará expuesto a través del subdominio CloudFront generado, listo para autenticar usuarios y redirigirlos al ecosistema SHRTN.
