// sc qc postgresql-x64-16

use serde_json::json;
use std::process::Command;

// Función para obtener el tipo de inicio del servicio en formato JSON
#[tauri::command]
pub fn obtener_tipo_inicio_servicio(servicio: &str) -> String {
    // Ejecuta el comando para consultar el estado del servicio
    let output = Command::new("sc").args(&["qc", servicio]).output();

    match output {
        Ok(output) if output.status.success() => {
            // Procesa la salida para encontrar el tipo de inicio
            let salida = String::from_utf8_lossy(&output.stdout);
            let tipo_inicio = if salida.contains("AUTO_START  (DELAYED)") {
                "Automático (Inicio retrasado)"
            } else if salida.contains("AUTO_START") {
                "Automático"
            } else if salida.contains("DEMAND_START") {
                "Manual"
            } else if salida.contains("DISABLED") {
                "Deshabilitado"
            } else {
                "Estado desconocido"
            };
            // Devuelve el resultado en JSON
            json!({
                "error": false,
                "mensaje": format!("Tipo de inicio actual: {}", tipo_inicio)
            })
            .to_string()
        }
        Ok(output) => {
            let error = String::from_utf8_lossy(&output.stderr);
            json!({
                "error": true,
                "mensaje": format!("Error al consultar el servicio: {}", error)
            })
            .to_string()
        }
        Err(e) => json!({
            "error": true,
            "mensaje": format!("Error al ejecutar comando: {}", e)
        })
        .to_string(),
    }
}

// Función para cambiar el tipo de inicio del servicio en formato JSON
#[tauri::command]
pub fn cambiar_tipo_inicio_servicio(servicio: &str, tipo: &str) -> String {
    // Determina el tipo de inicio basado en el parámetro
    let start_type = match tipo.to_lowercase().as_str() {
        "automático" => "auto",
        "manual" => "demand",
        "deshabilitado" => "disabled",
        "automático (inicio retrasado)" => "delayed-auto", // Automático con retraso
        _ => {
            return json!({
                "error": true,
                "mensaje": "Tipo de inicio no válido. Usa: Automático (Inicio retrasado), Automático, Manual o Deshabilitado."
            })
            .to_string()
        }
    };

    // Ejecuta el comando para cambiar el tipo de inicio del servicio
    let output = Command::new("sc")
        .args(&["config", servicio, &format!("start={}", start_type)])
        .output();

    match output {
        Ok(output) if output.status.success() => json!({
            "error": false,
            "mensaje": format!("El tipo de inicio para {} ha sido cambiado a {}", servicio, tipo)
        })
        .to_string(),
        Ok(output) => {
            let error = String::from_utf8_lossy(&output.stderr);
            json!({
                "error": true,
                "mensaje": format!("Error al cambiar el tipo de inicio: {}", error)
            })
            .to_string()
        }
        Err(e) => json!({
            "error": true,
            "mensaje": format!("Error al ejecutar comando: {}", e)
        })
        .to_string(),
    }
}
