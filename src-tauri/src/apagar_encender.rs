use serde::{Deserialize, Serialize};
use std::process::Command;

/// Estructura que define la respuesta JSON enviada al frontend.
///
/// Campos:
/// - `error`: Un booleano que indica si hubo un error (true en caso de error, false si la operación fue exitosa).
/// - `mensaje`: Un mensaje de texto con detalles sobre el resultado de la operación.
#[derive(Serialize, Deserialize)]
pub struct ApiResponse {
    pub error: bool,
    pub mensaje: String,
}

/// Inicia el servicio PostgreSQL para una versión específica.
///
/// Parámetros:
/// - `version`: Una cadena de texto que representa la versión de PostgreSQL a iniciar (por ejemplo, "x64-16").
///
/// Retorno:
/// - `ApiResponse`: Estructura que contiene:
///     - `error`: `false` si el servicio se inició correctamente; `true` si hubo un error.
///     - `mensaje`: Detalles sobre el éxito o error del comando.
pub fn start_postgresql_service(version: &str) -> ApiResponse {
    // Construye el nombre completo del servicio basado en la versión
    let service_name = format!("{}", version);

    // Ejecuta el comando del sistema para iniciar el servicio PostgreSQL usando la versión especificada
    let output = Command::new("cmd")
        .args(&["/C", &format!("net start {}", service_name)])
        .output();

    // Manejo de resultados
    match output {
        Ok(result) => {
            if result.status.success() {
                // Servicio iniciado exitosamente
                ApiResponse {
                    error: false,
                    mensaje: format!("El servicio {} se inició correctamente.", service_name),
                }
            } else {
                // Error al iniciar el servicio, mensaje de error detallado
                ApiResponse {
                    error: true,
                    mensaje: format!(
                        "Error al iniciar el servicio {}: {}",
                        service_name,
                        String::from_utf8_lossy(&result.stderr)
                    ),
                }
            }
        }
        // Error al ejecutar el comando
        Err(e) => ApiResponse {
            error: true,
            mensaje: format!("Error al ejecutar el comando: {:?}", e),
        },
    }
}

/// Detiene el servicio PostgreSQL para una versión específica.
///
/// Parámetros:
/// - `version`: Una cadena de texto que representa la versión de PostgreSQL a detener (por ejemplo, "x64-16").
///
/// Retorno:
/// - `ApiResponse`: Estructura que contiene:
///     - `error`: `false` si el servicio se detuvo correctamente; `true` si hubo un error.
///     - `mensaje`: Detalles sobre el éxito o error del comando.
pub fn stop_postgresql_service(version: &str) -> ApiResponse {
    // Construye el nombre completo del servicio basado en la versión
    let service_name = format!("{}", version);

    // Ejecuta el comando del sistema para detener el servicio PostgreSQL usando la versión especificada
    let output = Command::new("cmd")
        .args(&["/C", &format!("net stop {}", service_name)])
        .output();

    // Manejo de resultados
    match output {
        Ok(result) => {
            if result.status.success() {
                // Servicio detenido exitosamente
                ApiResponse {
                    error: false,
                    mensaje: format!("El servicio {} se detuvo correctamente.", service_name),
                }
            } else {
                // Error al detener el servicio, mensaje de error detallado
                ApiResponse {
                    error: true,
                    mensaje: format!(
                        "Error al detener el servicio {}: {}",
                        service_name,
                        String::from_utf8_lossy(&result.stderr)
                    ),
                }
            }
        }
        // Error al ejecutar el comando
        Err(e) => ApiResponse {
            error: true,
            mensaje: format!("Error al ejecutar el comando: {:?}", e),
        },
    }
}

// Aquí está la función para gestionar el servicio PostgreSQL
#[tauri::command]
pub fn manage_postgresql_service(action: &str, version: &str) -> ApiResponse {
    match action {
        "start" => start_postgresql_service(version),
        "stop" => stop_postgresql_service(version),
        _ => ApiResponse {
            error: true,
            mensaje: "Acción no válida".to_string(),
        },
    }
}
