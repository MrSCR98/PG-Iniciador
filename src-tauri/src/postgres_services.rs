// sc query type=service state=all

use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
pub struct Service {
    pub name: String,
    pub status: String,
}

#[derive(Serialize)]
#[serde(untagged)]
pub enum Response {
    Success {
        error: bool,
        contenido: Vec<Service>,
    },
    Error {
        error: bool,
        mensaje: String,
    },
}

#[tauri::command]
pub fn get_postgresql_services() -> Response {
    // Ejecutar el comando para obtener servicios de PostgreSQL
    let output = Command::new("sc")
        .args(&["query", "type=", "service", "state=", "all"])
        .output();

    match output {
        Ok(output) if output.status.success() => {
            let result = String::from_utf8_lossy(&output.stdout);

            // Imprimir la salida completa para depuración
            // println!("Salida del comando:\n{}", result);

            // Procesar la salida para extraer el nombre y estado del servicio
            let mut services: Vec<Service> = Vec::new();
            let mut current_service: Option<Service> = None;

            for line in result.lines() {
                if line.contains("NOMBRE_DE_SERVICIO")
                    || line.contains("NOMBRE_SERVICIO")
                    || line.contains("SERVICE_NAME")
                {
                    // ESPAÑOL y ingles
                    // Si ya hay un servicio en progreso, lo agregamos a la lista
                    if let Some(service) = current_service.take() {
                        services.push(service);
                    }
                    // Extraer el nombre del servicio
                    let parts: Vec<&str> = line.split(':').collect();
                    if parts.len() > 1 {
                        let name = parts[1].trim().to_string();
                        current_service = Some(Service {
                            name,
                            status: String::from("Estado no disponible"), // Inicialmente sin estado
                        });
                    }
                } else if line.contains("ESTADO") || line.contains("STATE") {
                    // ESPAÑOL y ingles
                    // Extraer el estado del servicio
                    if let Some(ref mut service) = current_service {
                        let parts: Vec<&str> = line.split(':').collect();
                        if parts.len() > 1 {
                            let status = parts[1].trim().to_string();
                            service.status = status;
                        }
                    }
                }
            }

            // Agregar el último servicio si existe
            if let Some(service) = current_service {
                services.push(service);
            }

            // Filtrar solo servicios de PostgreSQL
            let postgresql_services: Vec<Service> = services
                .into_iter()
                .filter(|s| s.name.to_lowercase().contains("postgresql"))
                .collect();

            if postgresql_services.is_empty() {
                Response::Error {
                    error: true,
                    mensaje: "No se encontraron servicios de PostgreSQL.".to_string(),
                }
            } else {
                Response::Success {
                    error: false,
                    contenido: postgresql_services,
                }
            }
        }
        // Manejar el caso donde el comando falló
        Ok(output) => {
            let error_message = String::from_utf8_lossy(&output.stderr).to_string();
            Response::Error {
                error: true,
                mensaje: format!("Error al ejecutar el comando: {}", error_message),
            }
        }
        // Manejar el caso donde ocurrió un error al ejecutar el comando
        Err(err) => Response::Error {
            error: true,
            mensaje: format!("Error al ejecutar el comando: {}", err),
        },
    }
}
